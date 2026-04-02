import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Todo, Category, Tag, Priority } from '../types'
import TodoForm from './TodoForm'

interface TodoItemProps {
  todo: Todo
  categories: Category[]
  tags: Tag[]
  onUpdate: (id: number, updates: Record<string, unknown>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

const priorityBadge: Record<Priority, { bg: string; text: string }> = {
  HIGH: { bg: 'bg-red-100', text: 'text-red-700' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  LOW: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

export default function TodoItem({ todo, categories, tags, onUpdate, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date()

  if (editing) {
    return (
      <TodoForm
        categories={categories}
        tags={tags}
        initialData={{
          title: todo.title,
          description: todo.description,
          priority: todo.priority,
          dueDate: todo.dueDate,
          categoryId: todo.categoryId,
          tagIds: todo.tags.map((t) => t.id),
        }}
        onSubmit={async (data) => {
          await onUpdate(todo.id, data)
          setEditing(false)
        }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
        todo.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400"
          tabIndex={-1}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <circle cx="4" cy="3" r="1.5"/><circle cx="12" cy="3" r="1.5"/>
            <circle cx="4" cy="8" r="1.5"/><circle cx="12" cy="8" r="1.5"/>
            <circle cx="4" cy="13" r="1.5"/><circle cx="12" cy="13" r="1.5"/>
          </svg>
        </button>

        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onUpdate(todo.id, { completed: !todo.completed })}
          className="mt-1.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {todo.title}
            </span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityBadge[todo.priority].bg} ${priorityBadge[todo.priority].text}`}>
              {todo.priority}
            </span>
            {todo.category && (
              <span
                className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: todo.category.color }}
              >
                {todo.category.name}
              </span>
            )}
          </div>
          {todo.description && (
            <p className="mt-1 text-sm text-gray-500 truncate">{todo.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {todo.tags.map((tag) => (
              <span key={tag.id} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">
                #{tag.name}
              </span>
            ))}
            {todo.dueDate && (
              <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                {isOverdue ? 'Overdue: ' : 'Due: '}
                {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={async () => {
              setDeleting(true)
              await onDelete(todo.id)
            }}
            disabled={deleting}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
