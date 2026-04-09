'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: 'system-ui', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #fee2e2', padding: '32px', maxWidth: '560px', width: '100%' }}>
          <h2 style={{ margin: '0 0 8px', color: '#111', fontSize: '18px' }}>Критическая ошибка</h2>
          <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '14px' }}>{error.message}</p>
          {error.stack && (
            <pre style={{ fontSize: '12px', color: '#dc2626', background: '#fef2f2', borderRadius: '8px', padding: '12px', overflow: 'auto', maxHeight: '200px', marginBottom: '16px' }}>
              {error.stack}
            </pre>
          )}
          <button
            onClick={reset}
            style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            Перезагрузить
          </button>
        </div>
      </body>
    </html>
  )
}
