export interface User {
  id: number
  email: string
  name: string
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Tag {
  id: number
  name: string
  _count?: { todos: number }
}

export interface Category {
  id: number
  name: string
  color: string
  _count?: { todos: number }
}

export interface Todo {
  id: number
  title: string
  description: string | null
  completed: boolean
  priority: Priority
  dueDate: string | null
  position: number
  categoryId: number | null
  category: Category | null
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

export interface TodoFilters {
  search?: string
  categoryId?: number
  priority?: Priority
  completed?: boolean
  tagId?: number
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'position'
  sortOrder?: 'asc' | 'desc'
}
