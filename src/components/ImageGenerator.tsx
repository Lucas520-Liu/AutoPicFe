'use client'

import { useState } from 'react'
import { Button } from './ui/button'

interface ImageSize {
  width: number
  height: number
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState<ImageSize>({ width: 512, height: 512 })
  const [taskId, setTaskId] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          width: size.width,
          height: size.height,
        }),
      })
      const data = await response.json()
      setTaskId(data.taskId)
      startPolling(data.taskId)
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setLoading(false)
    }
  }

  const startPolling = (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${taskId}`)
        const data = await response.json()
        if (data.status === 'completed') {
          setImages(data.images)
          clearInterval(pollInterval)
        } else if (data.status === 'failed') {
          console.error('Image generation failed')
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('Error polling status:', error)
        clearInterval(pollInterval)
      }
    }, 2000)
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
            />
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Image'}
        </Button>
      </form>

      {images.length > 0 && (
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