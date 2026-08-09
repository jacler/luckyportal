import cors from 'cors'
import crypto from 'crypto'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
const CONTENT_FILE = path.join(DATA_DIR, 'content.json')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'LuckyAdmin2026'
const TOKEN_SECRET = process.env.TOKEN_SECRET || ADMIN_PASSWORD
const PORT = Number(process.env.PORT || 8787)

const seedPath = path.join(__dirname, 'seed.json')
const defaultContent = JSON.parse(fs.readFileSync(seedPath, 'utf8'))

fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(defaultContent, null, 2), 'utf8')
}

function readContent() {
  return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'))
}

function writeContent(data) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), 'utf8')
}

function signToken() {
  const exp = Date.now() + 1000 * 60 * 60 * 12
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url')
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

function verifyToken(token) {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expect = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url')
  if (sig !== expect) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return typeof data.exp === 'number' && data.exp > Date.now()
  } catch {
    return false
  }
}

function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  next()
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.get('/content', (_req, res) => {
  const content = readContent()
  if (!content.projects?.length && defaultContent.projects) {
    // leave empty projects if intentionally cleared
  }
  res.json(content)
})

app.post('/login', (req, res) => {
  const password = String(req.body?.password || '')
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'invalid password' })
  }
  res.json({ token: signToken() })
})

app.put('/content', auth, (req, res) => {
  const body = req.body
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'invalid body' })
  }
  const next = {
    brand: String(body.brand || 'LUCKYPORTAL'),
    tagline: String(body.tagline || ''),
    ctaLabel: String(body.ctaLabel || ''),
    ctaHref: String(body.ctaHref || '#work'),
    about: String(body.about || ''),
    skills: Array.isArray(body.skills) ? body.skills.map(String) : [],
    github: String(body.github || ''),
    projects: Array.isArray(body.projects) ? body.projects : [],
  }
  writeContent(next)
  res.json(next)
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`luckyportal-api on :${PORT}`)
})
