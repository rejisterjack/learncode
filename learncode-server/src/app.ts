import express from 'express'
import cookieParser from 'cookie-parser'
import { authRouter } from './routes/auth.routes'
import { problemRouter } from './routes/problem.routes'
import { executionRouter } from './routes/execution.routes'
import { submissionRouter } from './routes/submission.routes'
import { playlistRouter } from './routes/playlist.routes'

const app = express()

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the API' })
})
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/problems', problemRouter)
app.use('/api/v1/execution', executionRouter)
app.use('/api/v1/submission', submissionRouter)

app.use('/api/v1/playlist', playlistRouter)

export default app
