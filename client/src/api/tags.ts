import client from './client'
import type { Tag } from '../types'

export async function fetchTags(): Promise<Tag[]> {
  const { data } = await client.get<{ tags: Tag[] }>('/tags')
  return data.tags
}

export async function createTag(name: string): Promise<Tag> {
  const { data } = await client.post<Tag>('/tags', { name })
  return data
}

export async function deleteTag(id: number): Promise<void> {
  await client.delete(`/tags/${id}`)
}
