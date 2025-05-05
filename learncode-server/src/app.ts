import express from 'express'
import cookieParser from 'cookie-parser'
import { authRouter } from './routes/auth.routes'
import { problemRouter } from './routes/problem.routes'

const app = express()

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the API' })
})
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/problems', problemRouter)

export default app
