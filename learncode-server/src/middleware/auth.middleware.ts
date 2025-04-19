import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { db } from "../libs/db"

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
      message: "Unauthorized - No token provided",
      authenticated: false,
    })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    ) as { id: string; [key: string]: any }

    const user = await db.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        authenticated: false,
      })
    }

    req.user = user
    req.userId = decoded.id

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
      authenticated: false,
    })
  }
}
