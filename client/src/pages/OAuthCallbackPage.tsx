import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('token', token)
      refreshUser().then(() => navigate('/'))
    } else {
      navigate('/login?error=oauth_failed')
    }
  }, [searchParams, navigate, refreshUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Signing you in...</p>
    </div>
  )
}
