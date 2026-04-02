import { useState } from 'react'
import type { Category, Tag } from '../types'
import * as categoriesApi from '../api/categories'
import * as tagsApi from '../api/tags'

interface CategorySidebarProps {
  categories: Category[]
  tags: Tag[]
  selectedCategoryId?: number
  onSelectCategory: (id?: number) => void
  onCategoriesChange: () => void
  onTagsChange: () => void
}

const PRESET_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280']

export default function CategorySidebar({
  categories, tags, selectedCategoryId, onSelectCategory, onCategoriesChange, onTagsChange,
}: CategorySidebarProps) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0])
  const [newTagName, setNewTagName] = useState('')
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showTagForm, setShowTagForm] = useState(false)

  async function addCategory() {
    if (!newCategoryName.trim()) return
    await categoriesApi.createCategory(newCategoryName.trim(), newCategoryColor)
    setNewCategoryName('')
    setShowCategoryForm(false)
    onCategoriesChange()
  }

  async function removeCategory(id: number) {
    await categoriesApi.deleteCategory(id)
    if (selectedCategoryId === id) onSelectCategory(undefined)
    onCategoriesChange()
  }

  async function addTag() {
    if (!newTagName.trim()) return
    await tagsApi.createTag(newTagName.trim())
    setNewTagName('')
    setShowTagForm(false)
    onTagsChange()
  }

  async function removeTag(id: number) {
    await tagsApi.deleteTag(id)
    onTagsChange()
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Categories</h3>
          <button
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + Add
          </button>
        </div>
        {showCategoryForm && (
          <div className="mb-3 space-y-2">
            <input
              type="text"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewCategoryColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${newCategoryColor === color ? 'border-gray-800' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button onClick={addCategory} className="w-full px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
              Add
            </button>
          </div>
        )}
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory(undefined)}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
              !selectedCategoryId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <div key={cat.id} className="group flex items-center">
              <button
                onClick={() => onSelectCategory(cat.id)}
                className={`flex-1 text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                  selectedCategoryId === cat.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="truncate">{cat.name}</span>
                {cat._count && <span className="text-xs text-gray-400 ml-auto">{cat._count.todos}</span>}
              </button>
              <button
                onClick={() => removeCategory(cat.id)}
                className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Tags</h3>
          <button
            onClick={() => setShowTagForm(!showTagForm)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + Add
          </button>
        </div>
        {showTagForm && (
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button onClick={addTag} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
              Add
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag.id} className="group inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              #{tag.name}
              {tag._count && <span className="text-gray-400">{tag._count.todos}</span>}
              <button
                onClick={() => removeTag(tag.id)}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          {tags.length === 0 && <span className="text-xs text-gray-400">No tags yet</span>}
        </div>
      </div>
    </div>
  )
}
