import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../libs/db'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      user?: {
        id: string
        [key: string]: any
      }
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - No token provided',
      authenticated: false,
    })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-key'
    ) as { id: string; [key: string]: any }

    const user = await db.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        authenticated: false,
      })
    }

    req.user = user
    req.userId = decoded.id

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid token',
      authenticated: false,
    })
  }
}

export const checkAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - No user ID found',
      })
    }
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - User not found',
      })
    }
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - User is not an admin',
      })
    }

    next()
  } catch (error) {
    console.error('Check admin error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
