import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { fetchContent } from '../api/client'
import { LogoMark } from '../components/LogoMark'
import { defaultContent, type SiteContent } from '../data/defaultContent'

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const reduce = useReducedMotion()

  useEffect(() => {
    void fetchContent().then(setContent)
  }, [])

  const featured = content.projects.filter((p) => p.featured)
  const gallery = content.projects.filter((p) => !p.featured)

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  return (
    <div className="site">
      <header className="nav">
        <a className="nav-brand" href="#top">
          <LogoMark className="nav-logo" />
          <span>{content.brand}</span>
        </a>
        <button
          className="nav-burger"
          aria-label="打开菜单"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <div className="menu-overlay" role="dialog" aria-modal>
          <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="关闭">
            ×
          </button>
          <nav className="menu-links">
            <a href="#work" onClick={() => setMenuOpen(false)}>
              Work
            </a>
            <a href="#more" onClick={() => setMenuOpen(false)}>
              Projects
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>
            <a href={content.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          </nav>
        </div>
      )}

      <main id="top">
        <section className="hero">
          <div className="hero-media" aria-hidden>
            <img src="/hero-coast.png" alt="" />
            <div className="hero-veil" />
          </div>

          <div className="hero-copy">
            <motion.div
              className="hero-mark"
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <LogoMark />
            </motion.div>
            <motion.h1
              className="hero-brand"
              initial="hidden"
              animate="show"
              variants={fadeUp}
            >
              {content.brand}
            </motion.h1>
            <motion.p
              className="hero-line"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              transition={{ delay: 0.1 }}
            >
              {content.tagline}
            </motion.p>
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              transition={{ delay: 0.18 }}
            >
              <a className="btn-cta" href={content.ctaHref}>
                {content.ctaLabel} <span aria-hidden>→</span>
              </a>
            </motion.div>
          </div>
        </section>

        <section className="section" id="work">
          <div className="section-head">
            <div>
              <p className="kicker">Featured</p>
              <h2 className="section-title">旗舰项目</h2>
            </div>
            <p className="section-note">
              Agent、统一 LLM 接口、可跑的量化 MVP——先看这三件。
            </p>
          </div>
          <div className="featured">
            {featured.map((p, i) => (
              <motion.article
                key={p.id}
                className="feature-row"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-10%' }}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
              >
                <span className="feature-index">0{i + 1}</span>
                <div>
                  <h3 className="feature-name">{p.name}</h3>
                  <p className="feature-tagline">{p.tagline}</p>
                  <p className="feature-desc">{p.description}</p>
                  <div className="tags">
                    {p.stack.map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <a className="feature-link" href={p.url} target="_blank" rel="noreferrer">
                  查看仓库 →
                </a>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="section" id="more">
          <div className="section-head">
            <div>
              <p className="kicker">More</p>
              <h2 className="section-title">更多作品</h2>
            </div>
          </div>
          <div className="gallery">
            {gallery.map((p, i) => (
              <motion.a
                key={p.id}
                className="gallery-item"
                href={p.url}
                target="_blank"
                rel="noreferrer"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-8%' }}
                variants={fadeUp}
                transition={{ delay: i * 0.06 }}
              >
                <h3>{p.name}</h3>
                <p className="tagline">{p.tagline}</p>
                <p>{p.description}</p>
                <span className="open">GitHub →</span>
              </motion.a>
            ))}
          </div>
        </section>

        <section className="section" id="about">
          <div className="section-head">
            <div>
              <p className="kicker">About</p>
              <h2 className="section-title">造系统的人</h2>
            </div>
          </div>
          <div className="about-wrap">
            <p className="about-copy">{content.about}</p>
            <div className="skills">
              {content.skills.map((s) => (
                <span className="skill" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          <strong>{content.brand}</strong> · Jacler
        </p>
        <p>
          <a href={content.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          {' · '}
          <Link to="/admin">Admin</Link>
        </p>
      </footer>
    </div>
  )
}
