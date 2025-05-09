import {
  addProblemToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllListDetails,
  getListDetailsById,
  removeProblemFromPlaylist,
} from '../controller/playlist.controller'
import { authMiddleware } from '../middleware/auth.middleware'

export const playlistRouter = require('express').Router()

playlistRouter.get('/', authMiddleware, getAllListDetails)
playlistRouter.get('/:playlistId', authMiddleware, getListDetailsById)
playlistRouter.post('/create-playlist', authMiddleware, createPlaylist)
playlistRouter.post(
  '/:playlistId/add-problem',
  authMiddleware,
  addProblemToPlaylist
)
playlistRouter.delete('/:playlistId', authMiddleware, deletePlaylist)
playlistRouter.delete(
  '/:playlistId/remove-problem/:problemId',
  authMiddleware,
  removeProblemFromPlaylist
)
