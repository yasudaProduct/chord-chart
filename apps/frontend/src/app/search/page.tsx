"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { songApi } from "@/lib/songApi";
import type { Song } from "@/types/song";

export default function SearchPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // TODO: バックエンド側で検索エンドポイントを用意し、１回のリクエストで完結させる
      const list = await songApi.list();
      const full = await Promise.all(list.map((item) => songApi.get(item.id)));
      setSongs(full);
      setIsLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const lowered = query.toLowerCase();
    return songs.filter((song) => {
      if (!lowered) return true;
      return (
        song.title.toLowerCase().includes(lowered) ||
        (song.artist ?? "").toLowerCase().includes(lowered) ||
        (song.key ?? "").toLowerCase().includes(lowered)
      );
    });
  }, [songs, query]);

  return (
    <main className="min-h-screen">
      <SiteHeader variant="app" />
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">
            検索
          </h1>
          <p className="text-sm text-slate-500">
            公開楽曲の検索画面（MVPでは全件から検索できます）。
          </p>
        </div>

        <div className="mt-6">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="曲名・アーティスト・キーで検索"
            className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none transition focus:border-slate-400"
          />
        </div>

        <div className="mt-8 grid gap-4">
          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
              読み込み中...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
              検索結果がありません。
            </div>
          ) : (
            filtered.map((song) => (
              <div
                key={song.id}
                className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.6)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {song.title}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {song.artist || "アーティスト未設定"} · Key{" "}
                      {song.key || "-"}
                    </p>
                  </div>
                  <Link
                    href={`/songs/${song.id}`}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    詳細を見る
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
