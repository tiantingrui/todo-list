import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.userId! },
      include: { _count: { select: { todos: true } } },
      orderBy: { name: 'asc' },
    })
    res.json({ categories })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body as { name: string; color?: string }
    if (!name) {
      res.status(400).json({ error: 'Name is required' })
      return
    }
    const category = await prisma.category.create({
      data: { name, color: color || '#6B7280', userId: req.userId! },
    })
    res.status(201).json(category)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.userId) {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    const { name, color } = req.body as { name?: string; color?: string }
    const category = await prisma.category.update({
      where: { id },
      data: { ...(name && { name }), ...(color && { color }) },
    })
    res.json(category)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.userId) {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    await prisma.category.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
