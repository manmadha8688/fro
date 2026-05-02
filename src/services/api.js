import apiClient from './client'
import {
  MOCK_FOLDERS,
  MOCK_DOCUMENTS_BY_FOLDER,
  mockChatResponse,
} from './mockData'

function isMockMode() {
  return import.meta.env.VITE_USE_MOCK !== 'false'
}

function delay(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * GET /auth/me — session user after OAuth (requires cookies).
 */
export async function fetchAuthMe() {
  if (isMockMode()) {
    await delay(200)
    return { user: null }
  }
  const { data } = await apiClient.get('/auth/me')
  return data
}

/**
 * POST /auth/logout — clear server session.
 */
export async function logoutAuth() {
  if (isMockMode()) {
    return { ok: true }
  }
  const { data } = await apiClient.post('/auth/logout', {})
  return data
}

/**
 * GET /auth/google — initiate OAuth (backend may redirect or return a URL).
 */
export async function initiateGoogleAuth() {
  if (isMockMode()) {
    await delay(700)
    return { authorization_url: null, mock_completed: true }
  }
  const { data } = await apiClient.get('/auth/google')
  return data
}

/**
 * GET /folders — list Drive folders available to the user.
 */
export async function fetchFolders() {
  if (isMockMode()) {
    await delay(380)
    return { folders: MOCK_FOLDERS }
  }
  const { data } = await apiClient.get('/folders')
  return data
}

/**
 * GET /documents?folder_id=
 */
export async function fetchDocuments(folderId) {
  if (isMockMode()) {
    await delay(420)
    const documents = MOCK_DOCUMENTS_BY_FOLDER[folderId] ?? []
    return { documents }
  }
  const { data } = await apiClient.get('/documents', {
    params: { folder_id: folderId },
  })
  return data
}

/**
 * POST /chat — question grounded in selected folder documents.
 */
export async function sendChat(payload) {
  if (isMockMode()) {
    await delay(850)
    const { question, folder_id } = payload
    return mockChatResponse(question, folder_id)
  }
  const { data } = await apiClient.post('/chat', payload)
  return data
}
