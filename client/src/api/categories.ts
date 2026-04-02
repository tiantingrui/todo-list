import client from './client'
import type { Category } from '../types'

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await client.get<{ categories: Category[] }>('/categories')
  return data.categories
}

export async function createCategory(name: string, color: string): Promise<Category> {
  const { data } = await client.post<Category>('/categories', { name, color })
  return data
}

export async function updateCategory(id: number, updates: { name?: string; color?: string }): Promise<Category> {
  const { data } = await client.put<Category>(`/categories/${id}`, updates)
  return data
}

export async function deleteCategory(id: number): Promise<void> {
  await client.delete(`/categories/${id}`)
}
