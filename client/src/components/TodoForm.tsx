import { useState, type FormEvent } from 'react'
import type { Category, Tag, Priority } from '../types'

interface TodoFormProps {
  categories: Category[]
  tags: Tag[]
  onSubmit: (data: {
    title: string
    description?: string
    priority?: Priority
    dueDate?: string
    categoryId?: number
    tagIds?: number[]
  }) => Promise<void>
  onCancel?: () => void
  initialData?: {
    title: string
    description: string | null
    priority: Priority
    dueDate: string | null
    categoryId: number | null
    tagIds: number[]
  }
}

export default function TodoForm({ categories, tags, onSubmit, onCancel, initialData }: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'MEDIUM')
  const [dueDate, setDueDate] = useState(initialData?.dueDate?.split('T')[0] || '')
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId?.toString() || '')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initialData?.tagIds || [])
  const [submitting, setSubmitting] = useState(false)

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      })
      if (!initialData) {
        setTitle('')
        setDescription('')
        setPriority('MEDIUM')
        setDueDate('')
        setCategoryId('')
        setSelectedTagIds([])
      }
    } finally {
      setSubmitting(false)
    }
  }

  const priorityColors: Record<Priority, string> = {
    LOW: 'bg-gray-100 text-gray-700 border-gray-300',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-300',
    HIGH: 'bg-red-50 text-red-700 border-red-300',
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      <input
        type="text"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full px-3 py-2 text-lg border-0 border-b border-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-400"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400"
      />
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1">
          {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                priority === p ? priorityColors[p] + ' ring-2 ring-offset-1 ring-blue-400' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                selectedTagIds.includes(tag.id)
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Saving...' : initialData ? 'Update' : 'Add Todo'}
        </button>
      </div>
    </form>
  )
}
