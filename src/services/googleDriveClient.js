const DRIVE_FILES = 'https://www.googleapis.com/drive/v3/files'

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` }
}

async function driveJson(url, accessToken) {
  const r = await fetch(url, { headers: authHeaders(accessToken) })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) {
    const msg = data?.error?.message || data?.error || r.statusText || 'Drive API error'
    throw new Error(msg)
  }
  return data
}

/**
 * @param {string} accessToken
 * @returns {Promise<{ folders: Array<{id: string, name: string, modifiedTime?: string}> }>}
 */
export async function listRootFolders(accessToken) {
  const q =
    "mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false"
  const params = new URLSearchParams({
    q,
    fields: 'files(id,name,modifiedTime)',
    pageSize: '100',
    orderBy: 'folder,name_natural',
  })
  const data = await driveJson(`${DRIVE_FILES}?${params}`, accessToken)
  const folders = (data.files ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    modifiedTime: f.modifiedTime,
  }))
  return { folders }
}

/**
 * @param {string} accessToken
 * @param {string} folderId
 */
export async function listFilesInFolder(accessToken, folderId) {
  const safe = String(folderId).replace(/'/g, "\\'")
  const q = `'${safe}' in parents and trashed=false`
  const params = new URLSearchParams({
    q,
    fields: 'files(id,name,mimeType,modifiedTime,size)',
    pageSize: '200',
    orderBy: 'folder,name_natural',
  })
  const data = await driveJson(`${DRIVE_FILES}?${params}`, accessToken)
  const documents = (data.files ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType ?? '',
    modifiedTime: f.modifiedTime,
    size: f.size,
  }))
  return { documents }
}
