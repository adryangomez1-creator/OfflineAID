import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'node:http';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { pool } from '../src/config/database.js';
import { poblarDatosIniciales } from '../src/config/seed.js';

process.env.JWT_SECRET ??= 'offlineaid-test-secret-at-least-32-bytes-long';

let server: Server;
let baseUrl: string;
let adminToken: string;
let operatorToken: string;
let citizenToken: string;
let adminId: number;
let citizenId: number;

async function api(path: string, token?: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(`${baseUrl}${path}`, { ...init, headers });
}

async function iniciarSesion(correo: string, password: string): Promise<{ token: string; id: number }> {
  const response = await api('/auth/login', undefined, {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  });
  assert.equal(response.status, 200);
  const data = await response.json();
  return { token: data.token, id: data.usuario.id_usuario };
}

before(async () => {
  await poblarDatosIniciales();
  await new Promise<void>(resolve => {
    server = app.listen(0, () => {
      const address = server.address();
      if (typeof address === 'object' && address) baseUrl = `http://localhost:${address.port}/api`;
      resolve();
    });
  });

  const admin = await iniciarSesion('admin@offlineaid.com', 'admin123');
  const operator = await iniciarSesion('operador@offlineaid.com', 'operador123');
  const citizen = await iniciarSesion('carlos.mendoza@email.com', 'carlos123');
  adminToken = admin.token;
  operatorToken = operator.token;
  adminId = admin.id;
  citizenToken = citizen.token;
  citizenId = citizen.id;
});

after(async () => {
  if (server) await new Promise<void>(resolve => server.close(() => resolve()));
  await pool.end();
});

test('el login público entrega un JWT firmado con rol y expiración', () => {
  const payload = jwt.verify(adminToken, process.env.JWT_SECRET!) as jwt.JwtPayload;
  assert.equal(payload.sub, String(adminId));
  assert.equal(payload.rol, 'ADMIN');
  assert.ok(payload.exp);
});

test('las rutas privadas rechazan llamadas sin token y bloquean el rol incorrecto', async () => {
  const sinToken = await api('/emergencias');
  assert.equal(sinToken.status, 401);

  const ciudadanoEnPanel = await api('/emergencias', citizenToken);
  assert.equal(ciudadanoEnPanel.status, 403);

  const adminReportando = await api('/emergencias/reportar', adminToken, {
    method: 'POST',
    body: JSON.stringify({ id_tipo: 1, titulo: 'No permitido', descripcion: 'Acceso de admin' }),
  });
  assert.equal(adminReportando.status, 403);
});

test('el ciudadano solo consulta su historial y el servidor toma su identidad del JWT', async () => {
  const reporte = await api('/emergencias/reportar', citizenToken, {
    method: 'POST',
    body: JSON.stringify({
      id_usuario: adminId,
      id_tipo: 1,
      titulo: `Prueba JWT ${Date.now()}`,
      descripcion: 'Reporte de integración autenticado',
      latitud: 14.6,
      longitud: -90.5,
    }),
  });
  assert.equal(reporte.status, 201);
  const reporteCreado = await reporte.json();

  const historial = await api(`/emergencias/usuario/${adminId}`, citizenToken);
  assert.equal(historial.status, 200);
  const emergencias = await historial.json();
  assert.ok(emergencias.some((item: { id_emergencia: number; id_usuario: number }) =>
    item.id_emergencia === reporteCreado.id_emergencia && item.id_usuario === citizenId
  ));
});

test('ADMIN y OPERADOR pueden consultar reportes y cambiar su estado', async () => {
  const lista = await api('/emergencias', adminToken);
  assert.equal(lista.status, 200);
  const emergencias = await lista.json();
  const propia = emergencias.find((item: { id_usuario: number }) => item.id_usuario === citizenId);
  assert.ok(propia);

  const listaOperador = await api('/emergencias', operatorToken);
  assert.equal(listaOperador.status, 200);

  const cambioAdmin = await api(`/emergencias/${propia.id_emergencia}/estado`, adminToken, {
    method: 'PUT',
    body: JSON.stringify({ estado: 'EN_PROCESO' }),
  });
  assert.equal(cambioAdmin.status, 200);

  const cambio = await api(`/emergencias/${propia.id_emergencia}/estado`, operatorToken, {
    method: 'PUT',
    body: JSON.stringify({ estado: 'ATENDIDA' }),
  });
  assert.equal(cambio.status, 200);

  const denegado = await api(`/emergencias/${propia.id_emergencia}/estado`, citizenToken, {
    method: 'PUT',
    body: JSON.stringify({ estado: 'ATENDIDA' }),
  });
  assert.equal(denegado.status, 403);
});

test('las rutas heredadas fuera de las dos vistas permanecen denegadas', async () => {
  const crud = await api('/usuarios', adminToken);
  assert.equal(crud.status, 403);

  const cola = await api('/cola-offline/pendientes', adminToken);
  assert.equal(cola.status, 403);
});