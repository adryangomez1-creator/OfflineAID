import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

export type RolAplicacion = 'ADMIN' | 'CIUDADANO';

function obtenerSecreto(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 bytes');
  }
  return secret;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: { id_usuario: number; rol: RolAplicacion };
    }
  }
}

export function crearToken(idUsuario: number, rol: RolAplicacion): string {
  return jwt.sign({ rol }, obtenerSecreto(), { subject: String(idUsuario), expiresIn: '2h' });
}

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  let secret: string;
  try {
    secret = obtenerSecreto();
  } catch {
    res.status(500).json({ error: 'La autenticación no está configurada' });
    return;
  }

  const [scheme, token] = (req.header('authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Se requiere un token de acceso' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    const idUsuario = Number(payload.sub);
    if (!Number.isInteger(idUsuario) || idUsuario <= 0 || !['ADMIN', 'CIUDADANO'].includes(payload.rol)) {
      res.status(401).json({ error: 'Token de acceso inválido' });
      return;
    }

    req.authUser = { id_usuario: idUsuario, rol: payload.rol as RolAplicacion };
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o vencido' });
  }
}

export function permitirRoles(...roles: RolAplicacion[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser || !roles.includes(req.authUser.rol)) {
      res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
      return;
    }
    next();
  };
}