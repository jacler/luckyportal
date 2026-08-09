import { defaultContent, type SiteContent } from '../data/defaultContent'

const API_BASE = import.meta.env.VITE_API_BASE || '/portal-api'

export async function fetchContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${API_BASE}/content`)
    if (!res.ok) throw new Error('content failed')
    const data = (await res.json()) as SiteContent
    if (!data.projects?.length) {
      return { ...defaultContent, ...data, projects: defaultContent.projects }
    }
    return { ...defaultContent, ...data }
  } catch {
    return defaultContent
  }
}

export async function login(password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) throw new Error('登录失败')
  const data = (await res.json()) as { token: string }
  return data.token
}

export async function saveContent(token: string, content: SiteContent): Promise<SiteContent> {
  const res = await fetch(`${API_BASE}/content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(content),
  })
  if (!res.ok) throw new Error('保存失败')
  return (await res.json()) as SiteContent
}
