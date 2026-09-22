import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database.js';

type UsuarioPublico = Omit<RowDataPacket, 'password'>;

function usuarioSeguro(usuario: RowDataPacket): UsuarioPublico {
  const { password: _password, ...seguro } = usuario;
  return seguro;
}

export const authController = {
  registrar: async (req: Request, res: Response): Promise<void> => {
    const { nombre, apellido, telefono, correo, password } = req.body;
    const campos = { nombre, apellido, correo, password };

    if (Object.values(campos).some(valor => typeof valor !== 'string' || !valor.trim())) {
      res.status(400).json({ error: 'Nombre, apellido, correo y contraseña son obligatorios' });
      return;
    }

    try {
      const correoNormalizado = correo.trim().toLowerCase();
      const [existentes] = await pool.query<RowDataPacket[]>(
        'SELECT id_usuario FROM Usuarios WHERE correo = ?', [correoNormalizado]
      );
      if (existentes.length) {
        res.status(409).json({ error: 'Ya existe una cuenta con este correo' });
        return;
      }

      const [resultado] = await pool.query<ResultSetHeader>(
        `INSERT INTO Usuarios (nombre, apellido, telefono, correo, password, rol, estado)
         VALUES (?, ?, ?, ?, ?, 'CIUDADANO', 'ACTIVO')`,
        [
          nombre.trim(), apellido.trim(), typeof telefono === 'string' ? telefono.trim() || null : null,
          correoNormalizado, password
        ]
      );
      const [usuarios] = await pool.query<RowDataPacket[]>('SELECT * FROM Usuarios WHERE id_usuario = ?', [resultado.insertId]);
      res.status(201).json({ mensaje: 'Cuenta creada correctamente', usuario: usuarioSeguro(usuarios[0]) });
    } catch (error: unknown) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ error: 'No se pudo crear la cuenta' });
    }
  },

  iniciarSesion: async (req: Request, res: Response): Promise<void> => {
    const { correo, password } = req.body;
    if (typeof correo !== 'string' || typeof password !== 'string' || !correo.trim() || !password) {
      res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
      return;
    }

    try {
      const [usuarios] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM Usuarios WHERE correo = ? AND password = ?', [correo.trim().toLowerCase(), password]
      );
      if (!usuarios.length) {
        res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        return;
      }
      if (usuarios[0].estado !== 'ACTIVO') {
        res.status(403).json({ error: 'Esta cuenta está inactiva' });
        return;
      }
      res.json({ mensaje: 'Inicio de sesión correcto', usuario: usuarioSeguro(usuarios[0]) });
    } catch (error: unknown) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ error: 'No se pudo iniciar sesión' });
    }
  }
};
