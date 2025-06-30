import api from './axios'

/** Payload for creating a new note */
export interface CreateNotePayload {
  date: string           // ISO date, e.g. '2025-07-15'
  description: string    // Note text
  category:  'all'
           | 'Health & Wellness'
           | 'Feeding'
           | 'Sleep'
           | 'Milestones'
           | 'Diaper & Potty'
           | 'Emotions & Behavior'
  kidId: string          // Associated kid’s ID
}

/** DTO for filtering / fetching notes */
export interface GetNotesParams {
  kidId?: string         // optional filter by child
  category?: CreateNotePayload['category']
  limit?: number
}

/** Represents a note returned from the API */
export interface Note {
  id: string
  date: string
  description: string
  category: CreateNotePayload['category']
  kidId: string
  createdAt: string
  updatedAt?: string
}

/**
 * Create a new note
 */
export const createNote = async (
  token: string,
  data: CreateNotePayload
): Promise<Note> => {
  const res = await api.post<Note>(
    '/notes/create',
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data
}

/**
 * Fetch notes, optionally filtering by kidId or category
 */
export const getNotes = async (
  token: string,
  params: GetNotesParams = {}
): Promise<Note[]> => {
  const res = await api.get<Note[]>(
    '/notes/get-all',
    {
      headers: { Authorization: `Bearer ${token}` },
      params,
    }
  )
  return res.data
}

/**
 * Update an existing note
 */
export const updateNote = async (
  token: string,
  noteId: string,
  updates: Partial<Omit<CreateNotePayload, 'kidId'>>
): Promise<Note> => {
  const res = await api.patch<Note>(
    `/notes/update/${noteId}`,
    updates,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data
}

/**
 * Delete a note by ID
 */
export const deleteNote = async (
  token: string,
  noteId: string
): Promise<{ success: boolean }> => {
  const res = await api.delete<{ success: boolean }>(
    `/notes/delete/${noteId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data
}
