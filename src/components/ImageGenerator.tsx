'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface ImageSize {
  width: number
  height: number
}

interface ImageResponse {
  success: boolean
  status: string
  data: Array<{
    url: string
  }>
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState<ImageSize>({ width: 512, height: 512 })
  const [taskId, setTaskId] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const pollCountRef = useRef(0)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null

    if (taskId && !images.length) {
      setGenerating(true)
      pollCountRef.current = 0
      
      const startPolling = async () => {
        pollCountRef.current += 1
        const delay = pollCountRef.current * 1000 // 1s, 2s, 3s, 4s

        pollInterval = setTimeout(async () => {
          try {
            // 获取当前会话用于认证
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
              setGenerating(false)
              setTaskId(null)
              router.push('/login')
              return
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${taskId}`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              }
            })
            const data: ImageResponse = await response.json()
            if (data.status === 'completed' && data.success && Array.isArray(data.data)) {
              setImages(data.data.map(item => item.url))
              setGenerating(false)
              setTaskId(null)
            } else if (data.status === 'failed') {
              console.error('Image generation failed')
              setGenerating(false)
              setTaskId(null)
            } else if (pollCountRef.current < 5) {
              // 如果还没到最大轮询次数，继续轮询
              startPolling()
            } else {
              // 达到最大轮询次数，停止轮询
              setGenerating(false)
              setTaskId(null)
              alert('图片生成超时，请重试')
            }
          } catch (error) {
            console.error('Error polling status:', error)
            setGenerating(false)
            setTaskId(null)
          }
        }, delay)
      }

      startPolling()
    }

    return () => {
      if (pollInterval) clearTimeout(pollInterval)
    }
  }, [taskId, images, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 检查登录状态
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    setLoading(true)
    setImages([])
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt,
          width: size.width,
          height: size.height,
        }),
      })
      const data = await response.json()
      if (data.taskId) {
        setTaskId(data.taskId)
      } else {
        throw new Error('No task ID received')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      alert('生成图片失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium">
            Image Description
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows={3}
            placeholder="Describe the image you want to generate..."
            required
            disabled={loading || generating}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="width" className="block text-sm font-medium">
              Width (px)
            </label>
            <input
              type="number"
              id="width"
              value={size.width}
              onChange={(e) => setSize({ ...size, width: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              min="256"
              max="1024"
              step="64"
              required
              disabled={loading || generating}
            />
          </div>
          <div>
            <label htmlFor="height" className="block text-sm font-medium">
              Height (px)
            </label>
            <input
              type="number"
              id="height"
              value={size.height}
              onChange={(e) => setSize({ ...size, height: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              min="256"
              max="1024"
              step="64"
              required
              disabled={loading || generating}
            />
          </div>
        </div>
        <Button type="submit" disabled={loading || generating}>
          {loading ? 'Submitting...' : generating ? 'Generating...' : 'Generate Image'}
        </Button>
      </form>

      {generating && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">正在生成图片，请稍候...</p>
        </div>
      )}

      {images && images.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Generated Images</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={image}
                  alt={`Generated image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 