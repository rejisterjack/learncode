import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db } from "../libs/db"

export const register = async (req: Request, res: Response) => {
  console.log("Register request body:", req.body)
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET || "fallback-secret-key",
      { expiresIn: "1d" }
    )

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "fallback-secret-key",
      { expiresIn: "1d" }
    )

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token")

    res.status(200).json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const check = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
        authenticated: false,
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    ) as { id: string }

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token",
        authenticated: false,
      })
    }

    return res.status(200).json({
      success: true,
      message: "User is authenticated",
      authenticated: true,
      user,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
      authenticated: false,
    })
  }
}
