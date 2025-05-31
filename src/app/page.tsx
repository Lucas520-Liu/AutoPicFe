'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import ImageGenerator from '@/components/ImageGenerator'
import Header from '@/components/Header'

interface UserData {
  user_id: string
  username: string
  priority: string
}

interface ApiResponse {
  success: boolean
  statusCode?: number
  message?: string
  redirectTo?: string
  data?: UserData
}

export default function Home() {
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState<UserData | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // 获取当前会话
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          // 没有登录，跳转到登录页
          router.push('/login')
          return
        }

        // 调用用户验证接口
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        const data: ApiResponse = await response.json()
        
        // 处理API响应
        if (data.redirectTo) {
          router.push(data.redirectTo)
          return
        }

        if (data.success && data.data) {
          // 验证成功，保存用户信息
          setUser(data.data)
          setChecking(false)
        } else {
          // 验证失败，跳转到登录页
          router.push('/login')
        }
      } catch (error) {
        console.error('Error verifying user:', error)
        // 验证失败，跳转到登录页
        router.push('/login')
      }
    }

    verifyUser()
  }, [router, supabase])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">正在验证账号...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto flex-1 px-4 py-8">
        {user && (
          <div className="mb-6 rounded-lg bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">欢迎回来，{user.username}！</h2>
                <p className="text-sm text-muted-foreground">账户等级：{user.priority}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">用户ID</p>
                <p className="text-sm font-mono">{user.user_id}</p>
              </div>
            </div>
          </div>
        )}
        <Suspense fallback={<div>Loading...</div>}>
          <ImageGenerator />
        </Suspense>
      </div>
    </div>
  )
} 