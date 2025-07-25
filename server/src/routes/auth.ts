import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Validaciones
const loginValidation = [
  body('username').notEmpty().withMessage('El usuario es requerido'),
  body('password').isLength({ min: 1 }).withMessage('La contraseña es requerida')
];

// POST /api/auth/login
router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Para desarrollo, permitir usuario demo sin base de datos
    if (username === 'adrian' && password === 'jopo') {
      const demoUser = {
        id: '1',
        username: 'adrian',
        email: 'adrian@saldiviabuses.com',
        firstName: 'Adrian',
        lastName: 'Saldivia',
        active: true,
        createdAt: new Date('2024-01-01').toISOString(),
        profile: {
          id: '1',
          name: 'Administrador',
          permissions: ['all']
        }
      };

      const accessToken = jwt.sign(
        { 
          userId: demoUser.id,
          username: demoUser.username,
          profileId: demoUser.profile.id
        },
        process.env.JWT_SECRET || 'saldivia-buses-secret-key',
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: demoUser.id },
        process.env.JWT_REFRESH_SECRET || 'saldivia-buses-refresh-secret',
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login exitoso',
        user: demoUser,
        token: accessToken,
        accessToken,
        refreshToken
      });
    }

    // Buscar usuario en base de datos
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        include: { profile: true }
      });

      if (!user || !user.active) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generar tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id,
          username: user.username,
          profileId: user.profile?.id
        },
        process.env.JWT_SECRET || 'saldivia-buses-secret-key',
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET || 'saldivia-buses-refresh-secret',
        { expiresIn: '7d' }
      );

      // Guardar sesión
      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      // Actualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      return res.json({
        message: 'Login exitoso',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          active: user.active,
          createdAt: user.createdAt.toISOString(),
          profile: user.profile
        },
        token: accessToken,
        accessToken,
        refreshToken
      });

    } catch (dbError) {
      console.log('Base de datos no disponible, usando modo demo');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requerido' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'saldivia-buses-refresh-secret'
    ) as any;

    // Generar nuevo access token
    const newAccessToken = jwt.sign(
      { 
        userId: decoded.userId,
        username: decoded.username,
        profileId: decoded.profileId
      },
      process.env.JWT_SECRET || 'saldivia-buses-secret-key',
      { expiresIn: '24h' }
    );

    return res.json({ accessToken: newAccessToken });

  } catch (error) {
    console.error('Error en refresh:', error);
    return res.status(401).json({ error: 'Refresh token inválido' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Eliminar sesión de la base de datos
        await prisma.session.deleteMany({
          where: { token }
        });
      } catch (dbError) {
        console.log('Base de datos no disponible para logout');
      }
    }

    return res.json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorización requerido' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'saldivia-buses-secret-key'
    ) as any;

    // Para usuario demo
    if (decoded.username === 'adrian') {
      // Leer datos del perfil demo desde archivo
      const path = require('path');
      const fs = require('fs');
      const demoProfilePath = path.join(__dirname, '../../demo-profile.json');
      let demoProfile: any = {
        firstName: 'Adrian',
        lastName: 'Saldivia',
        email: 'adrian@saldiviabuses.com',
        phone: '+54 3405 123456',
        department: 'Administración',
        position: 'Director General',
        profileImage: null
      };
      
      try {
        if (fs.existsSync(demoProfilePath)) {
          const profileData = fs.readFileSync(demoProfilePath, 'utf8');
          const savedProfile = JSON.parse(profileData);
          demoProfile = { ...demoProfile, ...savedProfile };
          console.log('Perfil demo cargado desde archivo:', demoProfile);
        } else {
          console.log('Archivo de perfil demo no existe, usando valores por defecto');
        }
      } catch (err) {
        console.log('Error leyendo perfil demo, usando valores por defecto:', err);
      }
      
      const userResponse = {
        user: {
          id: '1',
          username: 'adrian',
          email: demoProfile.email,
          firstName: demoProfile.firstName,
          lastName: demoProfile.lastName,
          active: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date('2024-01-01').toISOString(),
          profile: {
            id: '1',
            name: 'Administrador',
            permissions: ['all'],
            profileImage: demoProfile.profileImage,
            phone: demoProfile.phone,
            department: demoProfile.department,
            position: demoProfile.position
          }
        },
        timestamp: Date.now() // Agregar timestamp para forzar actualización
      };
      
      console.log('Respuesta del endpoint /me para usuario demo:', JSON.stringify(userResponse, null, 2));
      return res.json(userResponse);
    }

    try {
      // Buscar usuario en base de datos
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { 
          profile: {
            select: {
              id: true,
              name: true,
              description: true,
              permissions: true,
              profileImage: true,
              phone: true,
              department: true,
              position: true
            }
          }
        }
      });

      if (!user || !user.active) {
        return res.status(401).json({ error: 'Usuario inválido' });
      }

      return res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          active: user.active,
          lastLogin: user.lastLogin?.toISOString(),
          createdAt: user.createdAt.toISOString(),
          profile: user.profile
        }
      });

    } catch (dbError) {
      return res.status(401).json({ error: 'Token inválido' });
    }

  } catch (error) {
    console.error('Error en me:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
});

export default router; 