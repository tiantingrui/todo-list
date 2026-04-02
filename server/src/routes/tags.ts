import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { userId: req.userId! },
      include: { _count: { select: { todos: true } } },
      orderBy: { name: 'asc' },
    })
    res.json({ tags })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name: string }
    if (!name) {
      res.status(400).json({ error: 'Name is required' })
      return
    }
    const tag = await prisma.tag.create({
      data: { name, userId: req.userId! },
    })
    res.status(201).json(tag)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const existing = await prisma.tag.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.userId) {
      res.status(404).json({ error: 'Tag not found' })
      return
    }
    await prisma.tag.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
