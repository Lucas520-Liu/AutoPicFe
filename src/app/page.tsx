import { Suspense } from 'react'
import ImageGenerator from '@/components/ImageGenerator'
import Header from '@/components/Header'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto flex-1 px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <ImageGenerator />
        </Suspense>
      </div>
    </div>
  )
} 