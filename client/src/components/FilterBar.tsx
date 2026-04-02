import type { Category, Tag, TodoFilters, Priority } from '../types'

interface FilterBarProps {
  filters: TodoFilters
  onChange: (filters: TodoFilters) => void
  categories: Category[]
  tags: Tag[]
}

export default function FilterBar({ filters, onChange, categories, tags }: FilterBarProps) {
  function update(partial: Partial<TodoFilters>) {
    onChange({ ...filters, ...partial })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search todos..."
          value={filters.search || ''}
          onChange={(e) => update({ search: e.target.value || undefined })}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filters.priority || ''}
          onChange={(e) => update({ priority: (e.target.value as Priority) || undefined })}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select
          value={filters.completed === undefined ? '' : String(filters.completed)}
          onChange={(e) => update({ completed: e.target.value === '' ? undefined : e.target.value === 'true' })}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All status</option>
          <option value="false">Active</option>
          <option value="true">Completed</option>
        </select>
        <select
          value={filters.categoryId || ''}
          onChange={(e) => update({ categoryId: e.target.value ? Number(e.target.value) : undefined })}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 leading-6">Tags:</span>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => update({ tagId: filters.tagId === tag.id ? undefined : tag.id })}
              className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                filters.tagId === tag.id
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
