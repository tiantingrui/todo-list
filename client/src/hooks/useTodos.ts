import { useState, useEffect, useCallback } from 'react'
import type { Todo, TodoFilters } from '../types'
import * as todosApi from '../api/todos'

export function useTodos(filters?: TodoFilters) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await todosApi.fetchTodos(filters)
      setTodos(data)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  const addTodo = useCallback(async (todo: Parameters<typeof todosApi.createTodo>[0]) => {
    const created = await todosApi.createTodo(todo)
    setTodos((prev) => [created, ...prev])
    return created
  }, [])

  const updateTodo = useCallback(async (id: number, updates: Parameters<typeof todosApi.updateTodo>[1]) => {
    const updated = await todosApi.updateTodo(id, updates)
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }, [])

  const removeTodo = useCallback(async (id: number) => {
    await todosApi.deleteTodo(id)
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const reorder = useCallback(async (orderedIds: number[]) => {
    setTodos((prev) => {
      const map = new Map(prev.map((t) => [t.id, t]))
      return orderedIds.map((id) => map.get(id)!).filter(Boolean)
    })
    await todosApi.reorderTodos(orderedIds)
  }, [])

  return { todos, loading, addTodo, updateTodo, removeTodo, reorder, reload: load }
}
