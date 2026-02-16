'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { useAuthStore } from '@/stores/authStore'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim() || password !== confirm) return
    setUser({ id: email, email, name: name || undefined })
    router.push('/songs')
  }

  return (
    <main className="min-h-screen">
      <SiteHeader variant="public" />
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur">
          <h1 className="font-display text-2xl font-semibold text-slate-900">
            新規登録
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            MVP版ではローカルに保存し、すぐに試せます。
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm text-slate-600">
              表示名
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="バンド名 or 名前"
              />
            </label>
            <label className="block text-sm text-slate-600">
              メールアドレス
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="block text-sm text-slate-600">
              パスワード
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="********"
                required
              />
            </label>
            <label className="block text-sm text-slate-600">
              パスワード確認
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="********"
                required
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              アカウント作成
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-slate-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="font-semibold text-slate-800">
              ログイン
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
