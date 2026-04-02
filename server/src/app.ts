import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import todoRoutes from './routes/todos'
import categoryRoutes from './routes/categories'
import tagRoutes from './routes/tags'

const app = express()

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

export default app
