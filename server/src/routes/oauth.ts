import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

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
  const redirectUri = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3001'}/api/auth/oauth/github/callback`
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`
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

// ==================== Google OAuth ====================

router.get('/google', (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    res.status(500).json({ error: 'Google OAuth not configured' })
    return
  }
  const redirectUri = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3001'}/api/auth/oauth/google/callback`
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('openid email profile')}&access_type=offline`
  res.redirect(url)
})

router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query
    if (!code) {
      res.redirect(`${CLIENT_URL}/login?error=no_code`)
      return
    }

    const redirectUri = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3001'}/api/auth/oauth/google/callback`

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string }

    if (!tokenData.access_token) {
      res.redirect(`${CLIENT_URL}/login?error=token_failed`)
      return
    }

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const googleUser = await userRes.json() as { id: string; email: string; name: string }

    if (!googleUser.email) {
      res.redirect(`${CLIENT_URL}/login?error=no_email`)
      return
    }

    const user = await findOrCreateOAuthUser('google', googleUser.id, googleUser.email, googleUser.name)
    const token = makeToken(user.id)
    res.redirect(`${CLIENT_URL}/oauth-callback?token=${token}`)
  } catch {
    res.redirect(`${CLIENT_URL}/login?error=google_failed`)
  }
})

export default router
