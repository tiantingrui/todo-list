import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Category, Tag, TodoFilters } from '../types'
import { useTodos } from '../hooks/useTodos'
import * as categoriesApi from '../api/categories'
import * as tagsApi from '../api/tags'
import Layout from '../components/Layout'
import TodoForm from '../components/TodoForm'
import TodoList from '../components/TodoList'
import FilterBar from '../components/FilterBar'
import CategorySidebar from '../components/CategorySidebar'
import { useToast } from '../components/Toast'

export default function HomePage() {
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [filters, setFilters] = useState<TodoFilters>({})
  const [showForm, setShowForm] = useState(false)

  const stableFilters = useMemo(() => filters, [
    filters.search, filters.categoryId, filters.priority,
    filters.completed, filters.tagId, filters.sortBy, filters.sortOrder,
  ])
  const { todos, loading, addTodo, updateTodo, removeTodo, reorder } = useTodos(stableFilters)

  const loadCategories = useCallback(async () => {
    const data = await categoriesApi.fetchCategories()
    setCategories(data)
  }, [])

  const loadTags = useCallback(async () => {
    const data = await tagsApi.fetchTags()
    setTags(data)
  }, [])

  useEffect(() => {
    loadCategories()
    loadTags()
  }, [loadCategories, loadTags])

  return (
    <Layout>
      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <CategorySidebar
            categories={categories}
            tags={tags}
            selectedCategoryId={filters.categoryId}
            onSelectCategory={(id) => setFilters((f) => ({ ...f, categoryId: id }))}
            onCategoriesChange={loadCategories}
            onTagsChange={loadTags}
          />
        </aside>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">My Todos</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showForm ? 'Cancel' : '+ New Todo'}
            </button>
          </div>

          {showForm && (
            <TodoForm
              categories={categories}
              tags={tags}
              onSubmit={async (data) => {
                try {
                  await addTodo(data)
                  setShowForm(false)
                  toast.success('Todo added')
                } catch { toast.error('Failed to add todo') }
              }}
              onCancel={() => setShowForm(false)}
            />
          )}

          <FilterBar
            filters={filters}
            onChange={setFilters}
            categories={categories}
            tags={tags}
          />

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : (
            <TodoList
              todos={todos}
              categories={categories}
              tags={tags}
              onUpdate={async (id, updates) => {
                try { await updateTodo(id, updates); toast.success('Todo updated') }
                catch { toast.error('Failed to update todo') }
              }}
              onDelete={async (id) => {
                try { await removeTodo(id); toast.success('Todo deleted') }
                catch { toast.error('Failed to delete todo') }
              }}
              onReorder={reorder}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
