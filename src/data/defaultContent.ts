export type Project = {
  id: string
  name: string
  tagline: string
  description: string
  stack: string[]
  url: string
  featured?: boolean
}

export type SiteContent = {
  brand: string
  tagline: string
  ctaLabel: string
  ctaHref: string
  about: string
  skills: string[]
  github: string
  projects: Project[]
}

import { seed } from '../../shared/seed'

export const defaultContent: SiteContent = seed as SiteContent
