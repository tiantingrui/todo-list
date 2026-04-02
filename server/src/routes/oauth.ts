import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const API_BASE = process.env.CLIENT_URL || 'http://localhost:3001'

function makeToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

async function findOrCreateOAuthUser(
  provider: string,
  providerAccountId: string,
  email: string,
  name: string,
) {
  // Try to find by email first (link accounts)
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        password: `oauth:${provider}:${providerAccountId}`,
      },
    })
  }
  return user
}

// ==================== GitHub OAuth ====================

router.get('/github', (_req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    res.status(500).json({ error: 'GitHub OAuth not configured' })
    return
  }
  const redirectUri = `${API_BASE}/api/auth/oauth/github/callback`
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId.trim()}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`
  res.redirect(url)
})

router.get('/github/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query
    if (!code) {
      res.redirect(`${CLIENT_URL}/login?error=no_code`)
      return
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string }

    if (!tokenData.access_token) {
      res.redirect(`${CLIENT_URL}/login?error=token_failed`)
      return
    }

    // Get user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const githubUser = await userRes.json() as { id: number; login: string; name: string | null; email: string | null }

    // Get primary email if not public
    let email = githubUser.email
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      const emails = await emailsRes.json() as Array<{ email: string; primary: boolean; verified: boolean }>
      const primary = emails.find((e) => e.primary && e.verified)
      email = primary?.email || emails[0]?.email
    }

    if (!email) {
      res.redirect(`${CLIENT_URL}/login?error=no_email`)
      return
    }

    const user = await findOrCreateOAuthUser('github', String(githubUser.id), email, githubUser.name || githubUser.login)
    const token = makeToken(user.id)
    res.redirect(`${CLIENT_URL}/oauth-callback?token=${token}`)
  } catch {
    res.redirect(`${CLIENT_URL}/login?error=github_failed`)
  }
})

export default router
