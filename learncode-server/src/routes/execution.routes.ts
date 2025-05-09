import { executeCode } from "../controller/execute.controller"
import { authMiddleware } from "../middleware/auth.middleware"

export const executionRouter = require('express').Router()

executionRouter.post('/', authMiddleware, executeCode)