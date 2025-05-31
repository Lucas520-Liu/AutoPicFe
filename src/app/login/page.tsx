'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        if (error.message === 'Invalid login credentials') {
          // 账号未注册，显示提示并跳转到注册页面
          setError('该账号未注册，即将跳转到注册页面...')
          setTimeout(() => {
            router.push('/signup')
          }, 2000)
          return
        }
        throw error
      }
      
      router.push('/')
      router.refresh()
    } catch (error: any) {
      console.error('Error logging in:', error)
      setError(error.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold">登录</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-center text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </div>

          <div className="text-center text-sm">
            还没有账号？
            <Link href="/signup" className="text-primary hover:underline">
              立即注册
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 