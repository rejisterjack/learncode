import {
  createProblem,
  deleteProblemById,
  getAllProblemsSolvedByUser,
  getProblemById,
  getProblems,
  updateProblemById,
} from '../controller/problem.controller'
import { authMiddleware, checkAdmin } from '../middleware/auth.middleware'

export const problemRouter = require('express').Router()

problemRouter.post('/create-problem', authMiddleware, checkAdmin, createProblem)
problemRouter.get('/get-problems', authMiddleware, getProblems)
problemRouter.get('/get-problem/:id', authMiddleware, getProblemById)
problemRouter.put(
  '/update-problem/:id',
  authMiddleware,
  checkAdmin,
  updateProblemById
)
problemRouter.delete(
  '/delete-problem/:id',
  authMiddleware,
  checkAdmin,
  deleteProblemById
)
problemRouter.get(
  '/get-solved-problems',
  authMiddleware,
  getAllProblemsSolvedByUser
)
