export default function NavHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg text-white">
            Ψ
          </div>
          <div>
            <p className="text-sm text-slate-500">Behavior Research Lab</p>
            <p className="text-base font-semibold text-slate-900">线上心理学实验平台</p>
          </div>
        </div>
      </div>
    </header>
  )
}
