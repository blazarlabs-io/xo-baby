import api from './axios'

/** Payload for creating a new note */
export interface CreateNotePayload {
  date: string           // ISO date, e.g. '2025-07-15'
  description: string    // Note text
  category: 'all'
  | 'Health & Wellness'
  | 'Feeding'
  | 'Sleep'
  | 'Milestones'
  | 'Diaper & Potty'
  | 'Emotions & Behavior'
  kidId: string          // Associated kid's ID
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
  uid: string,
  data: CreateNotePayload
): Promise<Note> => {
  const res = await api.post<Note>(
    '/notes/create',
    data,
    { params: { uid } }
  )
  return res.data
}

/**
 * Fetch notes, optionally filtering by kidId or category
 */
export const getNotes = async (
  uid: string,
  params: GetNotesParams = {}
): Promise<Note[]> => {
  const res = await api.get<Note[]>(
    '/notes/get-all',
    {
      params: { ...params, uid },
    }
  )
  return res.data
}

/**
 * Update an existing note
 */
export const updateNote = async (
  uid: string,
  noteId: string,
  updates: Partial<Omit<CreateNotePayload, 'kidId'>>
): Promise<Note> => {
  const res = await api.put<Note>(
    `/notes/edit/${noteId}`,
    updates,
    { params: { uid } }
  )
  return res.data
}

/**
 * Delete a note by ID
 */
export const deleteNote = async (
  uid: string,
  noteId: string
): Promise<{ success: boolean }> => {
  const res = await api.delete<{ success: boolean }>(
    `/notes/delete/${noteId}`,
    { params: { uid } }
  )
  return res.data
}
