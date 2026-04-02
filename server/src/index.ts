import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import todoRoutes from './routes/todos'
import categoryRoutes from './routes/categories'
import tagRoutes from './routes/tags'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/todos', todoRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/tags', tagRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
