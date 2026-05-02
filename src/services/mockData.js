export const MOCK_FOLDERS = [
  { id: 'fld_eng', name: 'Engineering / RFCs' },
  { id: 'fld_hr', name: 'People Ops / Policies' },
  { id: 'fld_sales', name: 'Sales / Playbooks' },
]

export const MOCK_DOCUMENTS_BY_FOLDER = {
  fld_eng: [
    {
      id: 'doc_1',
      name: 'RFC-042 — Retrieval-augmented answers.pdf',
      mimeType: 'application/pdf',
      modifiedTime: '2026-04-12T14:22:00Z',
    },
    {
      id: 'doc_2',
      name: 'Incident response checklist.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      modifiedTime: '2026-03-01T09:10:00Z',
    },
    {
      id: 'doc_3',
      name: 'API design guidelines.md',
      mimeType: 'text/markdown',
      modifiedTime: '2026-02-18T11:45:00Z',
    },
  ],
  fld_hr: [
    {
      id: 'doc_4',
      name: 'Remote work policy 2026.pdf',
      mimeType: 'application/pdf',
      modifiedTime: '2026-01-05T08:00:00Z',
    },
    {
      id: 'doc_5',
      name: 'Benefits overview — Q1.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      modifiedTime: '2026-01-20T16:30:00Z',
    },
  ],
  fld_sales: [
    {
      id: 'doc_6',
      name: 'Enterprise discovery questions.md',
      mimeType: 'text/markdown',
      modifiedTime: '2026-04-02T13:00:00Z',
    },
    {
      id: 'doc_7',
      name: 'Security review FAQ.pdf',
      mimeType: 'application/pdf',
      modifiedTime: '2026-03-28T10:15:00Z',
    },
  ],
}

const DOC_SNIPPETS = {
  doc_1:
    'Answers must be grounded only in retrieved passages from user-selected folders; the system declines to speculate beyond cited sources.',
  doc_2:
    'During an incident, designate an incident lead, preserve logs, and communicate status every 15 minutes until resolved.',
  doc_3:
    'Prefer explicit schemas, idempotent operations, and pagination defaults of limit=50 with cursor-based continuation.',
  doc_4:
    'Remote employees may work across approved regions; equipment stipends renew annually on the hire anniversary.',
  doc_5:
    'Medical coverage includes vision and dental; enrollment changes are permitted during qualifying life events.',
  doc_6:
    'Discovery should clarify procurement timeline, data residency requirements, and SSO integration constraints.',
  doc_7:
    'We complete SOC 2 Type II annually; customers may request latest report under NDA via their account executive.',
}

function pickDocsForFolder(folderId) {
  const docs = MOCK_DOCUMENTS_BY_FOLDER[folderId] ?? []
  return docs.slice(0, 2)
}

export function mockChatResponse(question, folderId) {
  const q = (question || '').toLowerCase()
  const docs = MOCK_DOCUMENTS_BY_FOLDER[folderId] ?? []
  const primary = docs[0]

  let answer =
    'Based on the documents in your selected folder, the materials emphasize operational clarity and cite-specific workflows. If you ask about a topic not covered in these files, you should upload or select additional documents.'

  const citations = pickDocsForFolder(folderId).map((d, i) => ({
    document_id: d.id,
    title: d.name,
    snippet:
      DOC_SNIPPETS[d.id] ??
      `Relevant excerpt from “${d.name}” supporting this answer (mock snippet ${i + 1}).`,
  }))

  if (q.includes('incident') || q.includes('outage')) {
    answer =
      'According to your **Incident response checklist**, you should designate an incident lead, preserve logs, and send structured updates about every fifteen minutes until the incident is resolved.'
    citations.unshift({
      document_id: 'doc_2',
      title: 'Incident response checklist.docx',
      snippet: DOC_SNIPPETS.doc_2,
    })
  } else if (q.includes('remote') || q.includes('policy')) {
    answer =
      'The **Remote work policy** states that remote employees may work within approved regions and that equipment stipends renew on each hire anniversary.'
    citations.unshift({
      document_id: 'doc_4',
      title: 'Remote work policy 2026.pdf',
      snippet: DOC_SNIPPETS.doc_4,
    })
  } else if (q.includes('security') || q.includes('soc') || q.includes('compliance')) {
    answer =
      'Per your **Security review FAQ**, SOC 2 Type II is completed annually, and the latest report may be requested under NDA through the account executive.'
    citations.unshift({
      document_id: 'doc_7',
      title: 'Security review FAQ.pdf',
      snippet: DOC_SNIPPETS.doc_7,
    })
  } else if (q.includes('api') || q.includes('schema')) {
    answer =
      'Your **API design guidelines** recommend explicit schemas, idempotent operations, and cursor-based pagination with a default page size of fifty.'
    citations.unshift({
      document_id: 'doc_3',
      title: 'API design guidelines.md',
      snippet: DOC_SNIPPETS.doc_3,
    })
  } else if (primary) {
    answer = `Grounded in **${primary.name}**, the selected folder content supports answering general procedural questions. Ask something specific (for example “incident steps” or “remote policy”) for tighter citations.`
  }

  const unique = []
  const seen = new Set()
  for (const c of citations) {
    if (!seen.has(c.document_id)) {
      seen.add(c.document_id)
      unique.push(c)
    }
  }

  return {
    answer,
    citations: unique.slice(0, 4),
  }
}
