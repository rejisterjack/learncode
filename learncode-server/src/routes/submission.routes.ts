import {
  getAllSubmissions,
  getSubmissionsById,
  getSubmissionsCount,
} from '../controller/submission.controller'
import { authMiddleware } from '../middleware/auth.middleware'

export const submissionRouter = require('express').Router()

submissionRouter.get('/get-all-submissions', authMiddleware, getAllSubmissions)
submissionRouter.get(
  '/get-submission/:problemId',
  authMiddleware,
  getSubmissionsById
)
submissionRouter.get(
  '/get-submissions-count/:problemId',
  authMiddleware,
  getSubmissionsCount
)
