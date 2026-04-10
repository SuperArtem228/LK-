'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="bg-white rounded-xl border border-red-100 p-8 max-w-lg w-full">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">Произошла ошибка</h2>
        <p className="text-sm text-zinc-500 mb-4">{error.message}</p>
        {error.stack && (
          <pre className="text-xs text-red-600 bg-red-50 rounded p-3 overflow-auto mb-4 max-h-48">
            {error.stack}
          </pre>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 bg-lime-600 text-white text-sm rounded-lg hover:bg-lime-700"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  )
}
