import { Router, Request, Response } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'
import { authMiddleware } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

const todoInclude = {
  category: true,
  tags: { select: { id: true, name: true } },
} satisfies Prisma.TodoInclude

// Reorder — must be before /:id
router.put('/reorder', async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body as { orderedIds: number[] }
    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ error: 'orderedIds must be an array' })
      return
    }

    const userId = req.userId!
    // Verify all todos belong to user
    const todos = await prisma.todo.findMany({
      where: { id: { in: orderedIds }, userId },
      select: { id: true },
    })
    if (todos.length !== orderedIds.length) {
      res.status(403).json({ error: 'Some todos do not belong to you' })
      return
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.todo.update({ where: { id }, data: { position: index } })
      )
    )

    res.json({ message: 'Reordered successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// List with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!
    const { search, categoryId, priority, completed, tagId, sortBy, sortOrder } = req.query

    const where: Prisma.TodoWhereInput = { userId }

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
      ]
    }
    if (categoryId) where.categoryId = Number(categoryId)
    if (priority) where.priority = String(priority)
    if (completed !== undefined && completed !== '') {
      where.completed = completed === 'true'
    }
    if (tagId) {
      where.tags = { some: { id: Number(tagId) } }
    }

    const orderBy: Prisma.TodoOrderByWithRelationInput = {}
    if (sortBy && typeof sortBy === 'string') {
      const field = sortBy as keyof Prisma.TodoOrderByWithRelationInput
      orderBy[field] = (sortOrder === 'desc' ? 'desc' : 'asc') as Prisma.SortOrder
    } else {
      orderBy.position = 'asc'
    }

    const todos = await prisma.todo.findMany({
      where,
      include: todoInclude,
      orderBy,
    })

    res.json({ todos })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: Number(req.params.id) },
      include: todoInclude,
    })
    if (!todo || todo.userId !== req.userId) {
      res.status(404).json({ error: 'Todo not found' })
      return
    }
    res.json(todo)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!
    const { title, description, priority, dueDate, categoryId, tagIds } = req.body as {
      title: string
      description?: string
      priority?: string
      dueDate?: string
      categoryId?: number
      tagIds?: number[]
    }

    if (!title) {
      res.status(400).json({ error: 'Title is required' })
      return
    }

    // Get max position
    const maxPos = await prisma.todo.aggregate({
      where: { userId },
      _max: { position: true },
    })

    const todo = await prisma.todo.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        position: (maxPos._max.position ?? -1) + 1,
        userId,
        categoryId: categoryId || null,
        tags: tagIds ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: todoInclude,
    })

    res.status(201).json(todo)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Modify
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const existing = await prisma.todo.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.userId) {
      res.status(404).json({ error: 'Todo not found' })
      return
    }

    const { title, description, completed, priority, dueDate, categoryId, tagIds } = req.body as {
      title?: string
      description?: string | null
      completed?: boolean
      priority?: string
      dueDate?: string | null
      categoryId?: number | null
      tagIds?: number[]
    }

    const data: Prisma.TodoUpdateInput = {}
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (completed !== undefined) data.completed = completed
    if (priority !== undefined) data.priority = priority
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null
    if (categoryId !== undefined) {
      data.category = categoryId ? { connect: { id: categoryId } } : { disconnect: true }
    }
    if (tagIds !== undefined) {
      data.tags = { set: tagIds.map((tid) => ({ id: tid })) }
    }

    const todo = await prisma.todo.update({
      where: { id },
      data,
      include: todoInclude,
    })

    res.json(todo)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Remove
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const existing = await prisma.todo.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.userId) {
      res.status(404).json({ error: 'Todo not found' })
      return
    }

    await prisma.todo.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
