import { login, logout, check, register } from "../controller/auth.controller"

export const authRouter = require("express").Router()

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/logout", logout)
authRouter.post("/check", check)
