import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string | null;
    password: string;
    firstName?: string | null;
    lastName?: string | null;
    active: boolean;
    lastLogin?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    profileId?: string | null;
    profile?: any;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorización requerido' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'saldivia-buses-secret-key'
      ) as any;

      // Para usuario demo
      if (decoded.username === 'adrian') {
        req.user = {
          id: '1',
          username: 'adrian',
          email: 'adrian@saldiviabuses.com',
          password: '',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date(),
          profileId: '1',
          profile: {
            id: '1',
            name: 'Administrador',
            permissions: ['all']
          }
        };
        return next();
      }

      try {
        // Buscar usuario en base de datos
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { profile: true }
        });

        if (!user || !user.active) {
          return res.status(401).json({ error: 'Usuario inválido' });
        }

        // Verificar que la sesión existe
        const session = await prisma.session.findFirst({
          where: {
            userId: user.id,
            token: token,
            expiresAt: {
              gt: new Date()
            }
          }
        });

        if (!session) {
          return res.status(401).json({ error: 'Sesión inválida o expirada' });
        }

        req.user = user;
        next();

      } catch (dbError) {
        console.log('Base de datos no disponible, rechazando acceso');
        return res.status(401).json({ error: 'Token inválido' });
      }

    } catch (jwtError) {
      return res.status(401).json({ error: 'Token inválido' });
    }

  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Middleware para verificar permisos específicos
export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user?.profile?.permissions) {
      res.status(403).json({ 
        error: 'Acceso denegado. Sin permisos suficientes.' 
      });
      return;
    }

    const permissions = req.user.profile.permissions as string[];
    
    // Verificar si tiene permiso específico, 'all' o 'admin'
    if (!permissions.includes(permission) && 
        !permissions.includes('all') && 
        !permissions.includes('admin') &&
        !permissions.includes('ADMIN')) {
      res.status(403).json({ 
        error: `Acceso denegado. Se requiere permiso: ${permission}` 
      });
      return;
    }

    next();
  };
};

// Middleware para verificar si es administrador
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.profile?.permissions) {
    res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
    return;
  }

  const permissions = req.user.profile.permissions as string[];
  
  if (!permissions.includes('all') && 
      !permissions.includes('admin') &&
      !permissions.includes('ADMIN')) {
    res.status(403).json({ 
      error: 'Acceso denegado. Solo los administradores pueden realizar esta acción.' 
    });
    return;
  }

  next();
}; 