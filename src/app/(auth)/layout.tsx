export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-lg">
            <span className="text-2xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">What&apos;s for Dinner?</h1>
          <p className="mt-1 text-sm text-stone-500">Household meal planning made easy</p>
        </div>
        {children}
      </div>
    </div>
  )
}
