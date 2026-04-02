import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Todo, Category, Tag } from '../types'
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  categories: Category[]
  tags: Tag[]
  onUpdate: (id: number, updates: Record<string, unknown>) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onReorder: (orderedIds: number[]) => Promise<void>
}

export default function TodoList({ todos, categories, tags, onUpdate, onDelete, onReorder }: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = todos.findIndex((t) => t.id === active.id)
    const newIndex = todos.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = [...todos]
    const [moved] = newOrder.splice(oldIndex, 1)
    newOrder.splice(newIndex, 0, moved)
    onReorder(newOrder.map((t) => t.id))
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-lg font-medium">No todos yet</p>
        <p className="text-sm">Add one above to get started!</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              categories={categories}
              tags={tags}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
