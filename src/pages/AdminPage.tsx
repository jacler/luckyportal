import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { fetchContent, login, saveContent } from '../api/client'
import { LogoMark } from '../components/LogoMark'
import { defaultContent, type Project, type SiteContent } from '../data/defaultContent'

const TOKEN_KEY = 'luckyportal_admin_token'

function emptyProject(): Project {
  return {
    id: `p-${Date.now()}`,
    name: '',
    tagline: '',
    description: '',
    stack: [],
    url: '',
    featured: false,
  }
}

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [password, setPassword] = useState('')
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void fetchContent().then(setContent)
  }, [])

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus('')
    try {
      const t = await login(password)
      localStorage.setItem(TOKEN_KEY, t)
      setToken(t)
      setPassword('')
      setStatus('登录成功')
    } catch {
      setStatus('密码错误')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setStatus('')
    try {
      const saved = await saveContent(token, content)
      setContent(saved)
      setStatus('已保存，前台将立即生效')
    } catch {
      setStatus('保存失败，请重新登录')
      localStorage.removeItem(TOKEN_KEY)
      setToken('')
    } finally {
      setLoading(false)
    }
  }

  function updateProject(index: number, patch: Partial<Project>) {
    setContent((c) => {
      const projects = c.projects.map((p, i) => (i === index ? { ...p, ...patch } : p))
      return { ...c, projects }
    })
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
  }

  if (!token) {
    return (
      <div className="admin-shell">
        <form className="admin-login" onSubmit={handleLogin}>
          <LogoMark className="admin-logo" />
          <h1>LUCKYPORTAL Admin</h1>
          <p>管理门户文案与项目列表</p>
          <input
            type="password"
            placeholder="管理员密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={loading}>
            {loading ? '登录中…' : '进入后台'}
          </button>
          {status && <p className="admin-status">{status}</p>}
          <Link to="/" className="admin-back">
            ← 返回门户
          </Link>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-shell admin-panel">
      <header className="admin-bar">
        <div className="admin-bar-brand">
          <LogoMark />
          <span>Admin</span>
        </div>
        <div className="admin-bar-actions">
          <Link to="/">查看前台</Link>
          <button type="button" onClick={logout}>
            退出
          </button>
        </div>
      </header>

      <form className="admin-form" onSubmit={handleSave}>
        <section>
          <h2>首屏</h2>
          <label>
            品牌名
            <input
              value={content.brand}
              onChange={(e) => setContent({ ...content, brand: e.target.value })}
            />
          </label>
          <label>
            标语
            <textarea
              rows={3}
              value={content.tagline}
              onChange={(e) => setContent({ ...content, tagline: e.target.value })}
            />
          </label>
          <label>
            CTA 文案
            <input
              value={content.ctaLabel}
              onChange={(e) => setContent({ ...content, ctaLabel: e.target.value })}
            />
          </label>
          <label>
            CTA 链接
            <input
              value={content.ctaHref}
              onChange={(e) => setContent({ ...content, ctaHref: e.target.value })}
            />
          </label>
        </section>

        <section>
          <h2>关于</h2>
          <label>
            介绍
            <textarea
              rows={4}
              value={content.about}
              onChange={(e) => setContent({ ...content, about: e.target.value })}
            />
          </label>
          <label>
            技能标签（逗号分隔）
            <input
              value={content.skills.join(', ')}
              onChange={(e) =>
                setContent({
                  ...content,
                  skills: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
          <label>
            GitHub
            <input
              value={content.github}
              onChange={(e) => setContent({ ...content, github: e.target.value })}
            />
          </label>
        </section>

        <section>
          <div className="admin-section-head">
            <h2>项目</h2>
            <button
              type="button"
              className="btn-ghost-admin"
              onClick={() =>
                setContent({ ...content, projects: [...content.projects, emptyProject()] })
              }
            >
              + 添加项目
            </button>
          </div>
          {content.projects.map((p, i) => (
            <div className="admin-project" key={p.id}>
              <div className="admin-project-top">
                <strong>#{i + 1}</strong>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={!!p.featured}
                    onChange={(e) => updateProject(i, { featured: e.target.checked })}
                  />
                  旗舰
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setContent({
                      ...content,
                      projects: content.projects.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  删除
                </button>
              </div>
              <input
                placeholder="名称"
                value={p.name}
                onChange={(e) => updateProject(i, { name: e.target.value })}
              />
              <input
                placeholder="一句话"
                value={p.tagline}
                onChange={(e) => updateProject(i, { tagline: e.target.value })}
              />
              <textarea
                rows={3}
                placeholder="描述"
                value={p.description}
                onChange={(e) => updateProject(i, { description: e.target.value })}
              />
              <input
                placeholder="技术栈，逗号分隔"
                value={p.stack.join(', ')}
                onChange={(e) =>
                  updateProject(i, {
                    stack: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
              <input
                placeholder="GitHub URL"
                value={p.url}
                onChange={(e) => updateProject(i, { url: e.target.value })}
              />
            </div>
          ))}
        </section>

        <div className="admin-save-bar">
          <button type="submit" disabled={loading}>
            {loading ? '保存中…' : '保存全部'}
          </button>
          {status && <span className="admin-status">{status}</span>}
        </div>
      </form>
    </div>
  )
}
