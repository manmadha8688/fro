/* eslint-disable react-refresh/only-export-components -- paired Provider + hook */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { fetchDocuments, fetchFolders, sendChat as sendChatApi } from '../services/api'
import { listFilesInFolder, listRootFolders } from '../services/googleDriveClient'
import { getAuthMode } from '../utils/authMode'

const WorkspaceContext = createContext(null)

function nextId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `m_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function isInsufficientScopesError(err) {
  const msg = String(err?.response?.data?.detail ?? err?.message ?? '')
  return msg.includes('insufficient authentication scopes')
}

export function WorkspaceProvider({ children }) {
  const { toast } = useToast()
  const { googleAccessToken, invalidateBrowserGoogleAuth } = useAuth()
  const [folders, setFolders] = useState([])
  const [foldersLoading, setFoldersLoading] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [documents, setDocuments] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)

  const loadFolders = useCallback(async () => {
    setFoldersLoading(true)
    try {
      const mode = getAuthMode()
      if (mode === 'browser') {
        if (!googleAccessToken) {
          toast.error('Sign in with Google first.')
          setFolders([])
          return
        }
        const data = await listRootFolders(googleAccessToken)
        setFolders(data.folders ?? [])
        return
      }
      const data = await fetchFolders()
      setFolders(data.folders ?? [])
    } catch (err) {
      if (getAuthMode() === 'browser' && isInsufficientScopesError(err)) {
        invalidateBrowserGoogleAuth(
          'Add Drive scope in Google Cloud OAuth consent screen, revoke app access at myaccount.google.com/permissions, then sign in again.',
        )
        setFolders([])
        return
      }
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to load folders.'
      toast.error(msg)
      setFolders([])
    } finally {
      setFoldersLoading(false)
    }
  }, [toast, googleAccessToken, invalidateBrowserGoogleAuth])

  const selectFolder = useCallback(
    async (folder) => {
      setSelectedFolder(folder)
      setDocuments([])
      setMessages([])
      if (!folder?.id) return
      setDocumentsLoading(true)
      try {
        const mode = getAuthMode()
        let documents = []
        if (mode === 'browser') {
          if (!googleAccessToken) {
            toast.error('Sign in with Google first.')
          } else {
            const data = await listFilesInFolder(googleAccessToken, folder.id)
            documents = data.documents ?? []
          }
        } else {
          const data = await fetchDocuments(folder.id)
          documents = data.documents ?? []
        }
        setDocuments(documents)
        toast.success(`Loaded folder “${folder.name}”.`, 'Folder selected')
      } catch (err) {
        if (getAuthMode() === 'browser' && isInsufficientScopesError(err)) {
          invalidateBrowserGoogleAuth(
            'Add Drive scope in Google Cloud OAuth consent screen, revoke app access, then sign in again.',
          )
          setDocuments([])
          return
        }
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          'Failed to load documents.'
        toast.error(msg)
        setDocuments([])
      } finally {
        setDocumentsLoading(false)
      }
    },
    [toast, googleAccessToken, invalidateBrowserGoogleAuth],
  )

  const clearChat = useCallback(() => {
    setMessages([])
    toast.info('Chat cleared.')
  }, [toast])

  const sendChat = useCallback(
    async (question) => {
      const trimmed = question.trim()
      if (!trimmed) return
      if (!selectedFolder?.id) {
        toast.error('Select a folder before asking questions.')
        return
      }

      const userMsg = {
        id: nextId(),
        role: 'user',
        content: trimmed,
      }
      setMessages((m) => [...m, userMsg])
      setChatLoading(true)

      try {
        const payload = {
          question: trimmed,
          folder_id: selectedFolder.id,
          conversation: [
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: 'user', content: trimmed },
          ],
        }
        if (getAuthMode() === 'browser' && googleAccessToken) {
          payload.google_access_token = googleAccessToken
        }
        const data = await sendChatApi(payload)
        const assistantMsg = {
          id: nextId(),
          role: 'assistant',
          content: data.answer ?? '',
          citations: data.citations ?? [],
        }
        setMessages((m) => [...m, assistantMsg])
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          'Could not get an answer.'
        toast.error(msg)
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            role: 'assistant',
            content:
              'Something went wrong while contacting the assistant. Try again in a moment.',
            error: true,
            citations: [],
          },
        ])
      } finally {
        setChatLoading(false)
      }
    },
    [messages, selectedFolder, toast, googleAccessToken],
  )

  const value = useMemo(
    () => ({
      folders,
      foldersLoading,
      loadFolders,
      selectedFolder,
      selectFolder,
      documents,
      documentsLoading,
      messages,
      chatLoading,
      sendChat,
      clearChat,
    }),
    [
      folders,
      foldersLoading,
      loadFolders,
      selectedFolder,
      selectFolder,
      documents,
      documentsLoading,
      messages,
      chatLoading,
      sendChat,
      clearChat,
    ],
  )

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
