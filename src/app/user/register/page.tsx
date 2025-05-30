'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

function UserRegisterForm() {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [exchanging, setExchanging] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code')
      
      if (code) {
        // 如果有code参数，用code换取session
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          setExchanging(false)
        } catch (error) {
          console.error('Error exchanging code for session:', error)
          setError('验证失败，请重新注册')
          setExchanging(false)
        }
      } else {
        // 如果没有code参数，检查是否已经有有效的session
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            // 已经有有效的session，直接跳过交换过程
            setExchanging(false)
          } else {
            // 既没有code也没有session
            setError('缺少验证码且未登录，请重新注册')
            setExchanging(false)
          }
        } catch (error) {
          console.error('Error getting session:', error)
          setError('获取登录状态失败，请重新注册')
          setExchanging(false)
        }
      }
    }

    handleAuth()
  }, [searchParams, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nickname.trim()) {
      setError('请输入昵称')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 获取当前会话
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('登录状态已过期，请重新注册')
        return
      }

      // 调用后端注册接口
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          nickname: nickname.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '注册失败')
      }

      // 注册成功，跳转到主页
      router.push('/')
    } catch (error) {
      console.error('Error registering user:', error)
      setError(error instanceof Error ? error.message : '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (exchanging) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">正在验证身份...</p>
        </div>
      </div>
    )
  }

  if (error && !nickname) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg text-center">
          <h2 className="text-2xl font-bold text-destructive">验证失败</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => router.push('/signup')} className="w-full">
            重新注册
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold">完成注册</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            请设置您的昵称完成注册
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium mb-2">
              昵称
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              className="relative block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="请输入您的昵称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={loading}
            />
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
              {loading ? '注册中...' : '完成注册'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  )
}

export default function UserRegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UserRegisterForm />
    </Suspense>
  )
} 