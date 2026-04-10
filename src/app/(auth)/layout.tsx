export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-lime-50 flex items-center justify-center p-4">
      {children}
    </div>
  )
}
