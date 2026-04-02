import client from './client'
import type { Todo, TodoFilters } from '../types'

export async function fetchTodos(filters?: TodoFilters): Promise<Todo[]> {
  const params: Record<string, string> = {}
  if (filters?.search) params.search = filters.search
  if (filters?.categoryId) params.categoryId = String(filters.categoryId)
  if (filters?.priority) params.priority = filters.priority
  if (filters?.completed !== undefined) params.completed = String(filters.completed)
  if (filters?.tagId) params.tagId = String(filters.tagId)
  if (filters?.sortBy) params.sortBy = filters.sortBy
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder
  const { data } = await client.get<{ todos: Todo[] }>('/todos', { params })
  return data.todos
}

export async function createTodo(todo: {
  title: string
  description?: string
  priority?: string
  dueDate?: string
  categoryId?: number
  tagIds?: number[]
}): Promise<Todo> {
  const { data } = await client.post<Todo>('/todos', todo)
  return data
}

export async function updateTodo(id: number, updates: Partial<{
  title: string
  description: string | null
  completed: boolean
  priority: string
  dueDate: string | null
  categoryId: number | null
  tagIds: number[]
}>): Promise<Todo> {
  const { data } = await client.put<Todo>(`/todos/${id}`, updates)
  return data
}

export async function deleteTodo(id: number): Promise<void> {
  await client.delete(`/todos/${id}`)
}

export async function reorderTodos(orderedIds: number[]): Promise<void> {
  await client.put('/todos/reorder', { orderedIds })
}
