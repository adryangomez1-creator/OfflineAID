import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';
import { pool } from './database.js';

interface UsuarioPassword extends RowDataPacket {
  id_usuario: number;
  password: string;
}

const esHashBcrypt = (password: string): boolean => /^\$2[aby]\$\d{2}\$/.test(password);

async function migrarPasswords(): Promise<void> {
  const [usuarios] = await pool.query<UsuarioPassword[]>('SELECT id_usuario, password FROM Usuarios');
  let migradas = 0;

  for (const usuario of usuarios) {
    if (esHashBcrypt(usuario.password)) continue;

    const passwordHash = await bcrypt.hash(usuario.password, 10);
    await pool.query('UPDATE Usuarios SET password = ? WHERE id_usuario = ?', [passwordHash, usuario.id_usuario]);
    migradas++;
  }

  console.log(`Migración completada: ${migradas} contraseña(s) convertida(s).`);
}

migrarPasswords()
  .catch((error: unknown) => {
    console.error('Error al migrar contraseñas:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
