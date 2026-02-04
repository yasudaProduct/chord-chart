"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn, generateId } from "@/lib/utils";
import { songApi } from "@/lib/songApi";
import {
  createEmptyLine,
  createSection,
  parseSectionContent,
  serializeSectionContent,
  type ChordBlock,
  type SectionLine,
} from "@/lib/sectionContent";
import type { Section, SectionType, Song } from "@/types/song";

const CHORD_LIBRARY = ["A", "Am", "A7", "Am7", "Amaj7", "Asus4", "Aadd9"];
const NEXT_CHORDS = ["G", "C", "Am", "Dm"];
const SUBSTITUTE_CHORDS = ["Am7", "Fmaj7", "Dm7"];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const cloneSectionContent = (content: string) => {
  const parsed = parseSectionContent(content);
  const clonedLines: SectionLine[] = parsed.lines.map((line) => ({
    id: generateId(),
    lyrics: line.lyrics,
    chords: line.chords.map((chord) => ({
      id: generateId(),
      chord: chord.chord,
      offset: chord.offset,
    })),
  }));
  return serializeSectionContent(clonedLines);
};

type ChordDialogState = {
  sectionId: string;
  lineId: string;
  chordId?: string;
  offset: number;
  value: string;
  position: { x: number; y: number };
};

type DragChordState = {
  sectionId: string;
  lineId: string;
  chordId: string;
  rect: DOMRect;
  startX: number;
  moved: boolean;
};

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [dialog, setDialog] = useState<ChordDialogState | null>(null);
  const [draggingChord, setDraggingChord] = useState<DragChordState | null>(
    null
  );
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data = await songApi.get(params.id);
        setSong(data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [params.id]);

  useEffect(() => {
    if (!draggingChord) return;

    const handleMove = (event: PointerEvent) => {
      setDraggingChord((prev) => {
        if (!prev) return prev;
        const offset = clamp(
          (event.clientX - prev.rect.left) / prev.rect.width
        );
        updateChordOffset(prev.sectionId, prev.lineId, prev.chordId, offset);
        return {
          ...prev,
          moved: prev.moved || Math.abs(event.clientX - prev.startX) > 3,
        };
      });
    };

    const handleUp = () => {
      setDraggingChord((prev) => {
        if (prev && !prev.moved) {
          const targetLine = findLine(prev.sectionId, prev.lineId);
          const chord = targetLine?.chords.find(
            (item) => item.id === prev.chordId
          );
          if (chord) {
            openDialog({
              sectionId: prev.sectionId,
              lineId: prev.lineId,
              chordId: chord.id,
              offset: chord.offset,
              value: chord.chord,
              position: {
                x: prev.rect.left + prev.rect.width * chord.offset,
                y: prev.rect.top,
              },
            });
          }
        }
        return null;
      });
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [draggingChord]);

  const updateSong = (updater: (current: Song) => Song) => {
    setSong((prev) => (prev ? updater(prev) : prev));
    setIsDirty(true);
  };

  const updateSection = (
    sectionId: string,
    updater: (section: Section) => Section
  ) => {
    updateSong((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? updater(section) : section
      ),
    }));
  };

  const updateSectionLines = (
    sectionId: string,
    updater: (lines: SectionLine[]) => SectionLine[]
  ) => {
    updateSection(sectionId, (section) => {
      const { lines } = parseSectionContent(section.content);
      const nextLines = updater(lines);
      return {
        ...section,
        content: serializeSectionContent(nextLines),
      };
    });
  };

  const findLine = (sectionId: string, lineId: string) => {
    const section = song?.sections.find((item) => item.id === sectionId);
    if (!section) return null;
    const { lines } = parseSectionContent(section.content);
    return lines.find((line) => line.id === lineId) ?? null;
  };

  const updateChordOffset = (
    sectionId: string,
    lineId: string,
    chordId: string,
    offset: number
  ) => {
    updateSectionLines(sectionId, (lines) =>
      lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              chords: line.chords.map((chord) =>
                chord.id === chordId ? { ...chord, offset } : chord
              ),
            }
          : line
      )
    );
  };

  const handleMetaChange = (
    field: keyof Song,
    value: string | number | undefined
  ) => {
    updateSong((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!song) return;
    setIsSaving(true);
    try {
      const updated = await songApi.update(song.id, song);
      setSong(updated);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!song || typeof window === "undefined") return;
    const url = `${window.location.origin}/share/${song.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("共有URLをコピーしました");
    } catch {
      setShareMessage("共有URLのコピーに失敗しました");
    }
    setTimeout(() => setShareMessage(""), 2500);
  };

  const addSection = (name: string, type: SectionType) => {
    updateSong((prev) => ({
      ...prev,
      sections: [...prev.sections, createSection(name, type)],
    }));
  };

  const duplicateSection = (sectionId: string) => {
    updateSong((current) => {
      const index = current.sections.findIndex((section) => section.id === sectionId);
      if (index === -1) return current;
      const source = current.sections[index];
      const duplicated: Section = {
        ...source,
        id: generateId(),
        name: `${source.name} コピー`,
        content: cloneSectionContent(source.content),
      };
      const next = [...current.sections];
      next.splice(index + 1, 0, duplicated);
      return { ...current, sections: next };
    });
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    updateSong((current) => {
      const index = current.sections.findIndex((section) => section.id === sectionId);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.sections.length) return current;
      const next = [...current.sections];
      const [removed] = next.splice(index, 1);
      next.splice(target, 0, removed);
      return { ...current, sections: next };
    });
  };

  const deleteSection = (sectionId: string) => {
    updateSong((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== sectionId),
    }));
  };

  const addLine = (sectionId: string) => {
    updateSectionLines(sectionId, (lines) => [...lines, createEmptyLine()]);
  };

  const updateLineLyrics = (
    sectionId: string,
    lineId: string,
    lyrics: string
  ) => {
    updateSectionLines(sectionId, (lines) =>
      lines.map((line) => (line.id === lineId ? { ...line, lyrics } : line))
    );
  };

  const addChord = (
    sectionId: string,
    lineId: string,
    chord: string,
    offset: number
  ) => {
    updateSectionLines(sectionId, (lines) =>
      lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              chords: [
                ...line.chords,
                { id: generateId(), chord, offset },
              ].sort((a, b) => a.offset - b.offset),
            }
          : line
      )
    );
  };

  const updateChord = (
    sectionId: string,
    lineId: string,
    chordId: string,
    chord: string
  ) => {
    updateSectionLines(sectionId, (lines) =>
      lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              chords: line.chords.map((item) =>
                item.id === chordId ? { ...item, chord } : item
              ),
            }
          : line
      )
    );
  };

  const deleteChord = (sectionId: string, lineId: string, chordId: string) => {
    updateSectionLines(sectionId, (lines) =>
      lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              chords: line.chords.filter((item) => item.id !== chordId),
            }
          : line
      )
    );
  };

  const openDialog = (next: ChordDialogState) => {
    if (typeof window !== "undefined") {
      const width = 320;
      const height = 260;
      const x = Math.min(
        window.innerWidth - width - 16,
        Math.max(16, next.position.x - width / 2)
      );
      const y = Math.min(
        window.innerHeight - height - 16,
        Math.max(96, next.position.y + 16)
      );
      setDialog({ ...next, position: { x, y } });
      return;
    }
    setDialog(next);
  };

  const handleChordRowClick = (
    event: React.MouseEvent<HTMLDivElement>,
    sectionId: string,
    lineId: string
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offset = clamp((event.clientX - rect.left) / rect.width);
    openDialog({
      sectionId,
      lineId,
      offset,
      value: "",
      position: { x: event.clientX, y: rect.top },
    });
  };

  const handleChordConfirm = () => {
    if (!dialog) return;
    if (!dialog.value.trim()) {
      setDialog(null);
      return;
    }
    if (dialog.chordId) {
      updateChord(
        dialog.sectionId,
        dialog.lineId,
        dialog.chordId,
        dialog.value.trim()
      );
    } else {
      addChord(
        dialog.sectionId,
        dialog.lineId,
        dialog.value.trim(),
        dialog.offset
      );
    }
    setDialog(null);
  };

  const handleChordDelete = () => {
    if (!dialog || !dialog.chordId) return;
    deleteChord(dialog.sectionId, dialog.lineId, dialog.chordId);
    setDialog(null);
  };

  const handleChordBlockPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    sectionId: string,
    lineId: string,
    chord: ChordBlock
  ) => {
    event.stopPropagation();
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    setDraggingChord({
      sectionId,
      lineId,
      chordId: chord.id,
      rect,
      startX: event.clientX,
      moved: false,
    });
  };

  const handleSectionDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    sectionId: string
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", sectionId);
    setDraggingSectionId(sectionId);
  };

  const handleSectionDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    overId: string
  ) => {
    event.preventDefault();
    if (!draggingSectionId || draggingSectionId === overId) return;
    updateSong((current) => {
      const sections = [...current.sections];
      const fromIndex = sections.findIndex(
        (section) => section.id === draggingSectionId
      );
      const toIndex = sections.findIndex((section) => section.id === overId);
      if (fromIndex === -1 || toIndex === -1) return current;
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return { ...current, sections };
    });
  };

  const handleSectionDragEnd = () => {
    setDraggingSectionId(null);
  };

  const hasSections = useMemo(() => (song?.sections.length ?? 0) > 0, [song]);

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-slate-500">
          読み込み中...
        </div>
      </main>
    );
  }

  if (!song) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-slate-500">
          楽曲が見つかりませんでした。
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7] text-slate-800">
      <header className="print-hidden fixed top-0 z-50 flex w-full items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-display text-lg font-semibold text-primary"
          >
            ChordBook
          </Link>
          <button
            type="button"
            onClick={() => router.push("/songs")}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← マイライブラリ
          </button>
          {isDirty && <span className="text-xs text-amber-600">未保存</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-600">
            <span>プレビュー</span>
            <button
              type="button"
              onClick={() => setIsPreview((prev) => !prev)}
              className={cn(
                "relative h-5 w-9 rounded-full transition",
                isPreview ? "bg-primary" : "bg-slate-300"
              )}
              aria-label="プレビュー切替"
            >
              <span
                className={cn(
                  "absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition",
                  isPreview && "translate-x-4"
                )}
              />
            </button>
          </div>
          <button
            type="button"
            className="rounded-md px-3 py-2 text-xs text-slate-600 hover:bg-slate-100"
          >
            ⌘K ショートカット
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:border-slate-400"
          >
            🖨 印刷
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:border-slate-400"
          >
            ↗ 共有
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
          >
            {isSaving ? "保存中..." : "保存"}
          </button>
        </div>
      </header>

      <div className={cn("flex min-h-screen pt-16", isPreview && "bg-white")}>
        <div
          className={cn(
            "flex-1 px-6 py-8 transition",
            isPreview ? "w-1/2 max-w-none pr-4" : "mx-auto max-w-[820px]"
          )}
        >
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <input
              type="text"
              value={song.title}
              onChange={(event) =>
                handleMetaChange("title", event.target.value)
              }
              className="w-full border-none text-3xl font-bold text-slate-800 outline-none placeholder:text-slate-300"
              placeholder="曲名を入力..."
            />
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <label className="text-xs font-medium text-slate-500">
                アーティスト
                <input
                  type="text"
                  value={song.artist ?? ""}
                  onChange={(event) =>
                    handleMetaChange("artist", event.target.value)
                  }
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                />
              </label>
              <label className="text-xs font-medium text-slate-500">
                キー
                <input
                  type="text"
                  value={song.key ?? ""}
                  onChange={(event) =>
                    handleMetaChange("key", event.target.value)
                  }
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                />
                <span className="ml-2 inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  ✓ 自動検出
                </span>
              </label>
              <label className="text-xs font-medium text-slate-500">
                BPM
                <input
                  type="number"
                  value={song.bpm ?? ""}
                  onChange={(event) =>
                    handleMetaChange(
                      "bpm",
                      event.target.value === ""
                        ? undefined
                        : Number(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                  min={40}
                  max={240}
                />
              </label>
              <label className="text-xs font-medium text-slate-500">
                拍子
                <input
                  type="text"
                  value={song.timeSignature}
                  onChange={(event) =>
                    handleMetaChange("timeSignature", event.target.value)
                  }
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {song.sections.map((section, index) => {
              const content = parseSectionContent(section.content);
              return (
                <div
                  key={section.id}
                  className={cn(
                    "overflow-hidden rounded-2xl bg-white shadow-sm",
                    draggingSectionId === section.id && "opacity-70"
                  )}
                  onDragOver={(event) =>
                    handleSectionDragOver(event, section.id)
                  }
                  onDragEnd={handleSectionDragEnd}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        draggable
                        onDragStart={(event) =>
                          handleSectionDragStart(event, section.id)
                        }
                        onDragEnd={handleSectionDragEnd}
                        className="cursor-grab text-lg text-slate-300 active:cursor-grabbing"
                        aria-label="セクションをドラッグして並び替え"
                      >
                        ⋮⋮
                      </button>
                      <input
                        type="text"
                        value={section.name}
                        onChange={(event) =>
                          updateSection(section.id, (current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        className="rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-slate-600 outline-none focus:border-primary"
                      />
                      <div className="flex rounded-md bg-slate-200 p-1 text-xs">
                        {(["lyrics-chord", "chord-only"] as const).map(
                          (type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                updateSection(section.id, (current) => ({
                                  ...current,
                                  type,
                                }))
                              }
                              className={cn(
                                "rounded-md px-3 py-1 text-xs transition",
                                section.type === type
                                  ? "bg-white text-slate-800 shadow"
                                  : "text-slate-600"
                              )}
                            >
                              {type === "lyrics-chord"
                                ? "歌詞+コード"
                                : "コード"}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <button
                        type="button"
                        onClick={() => duplicateSection(section.id)}
                        className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
                        aria-label="セクションを複製"
                        title="複製"
                      >
                        📋
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(section.id, -1)}
                        disabled={index === 0}
                        className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                        aria-label="セクションを上に移動"
                        title="上に移動"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(section.id, 1)}
                        disabled={index === song.sections.length - 1}
                        className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                        aria-label="セクションを下に移動"
                        title="下に移動"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSection(section.id)}
                        className="rounded-md px-2 py-1 text-red-500 hover:bg-red-50"
                        aria-label="セクションを削除"
                        title="削除"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5 px-4 py-5">
                    {content.lines.map((line) => (
                      <div key={line.id} className="space-y-2">
                        <div
                          className="relative min-h-[36px] rounded-md border border-slate-200 bg-white"
                          onClick={(event) =>
                            handleChordRowClick(event, section.id, line.id)
                          }
                        >
                          {line.chords.map((chord) => (
                            <button
                              key={chord.id}
                              type="button"
                              onClick={(event) => event.stopPropagation()}
                              onPointerDown={(event) =>
                                handleChordBlockPointerDown(
                                  event,
                                  section.id,
                                  line.id,
                                  chord
                                )
                              }
                              className="absolute rounded-md bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow"
                              style={{
                                left: `${chord.offset * 100}%`,
                                transform: "translateX(-50%)",
                              }}
                            >
                              {chord.chord}
                            </button>
                          ))}
                        </div>
                        {section.type === "lyrics-chord" && (
                          <input
                            type="text"
                            value={line.lyrics}
                            onChange={(event) =>
                              updateLineLyrics(
                                section.id,
                                line.id,
                                event.target.value
                              )
                            }
                            placeholder="歌詞を入力...（上のエリアをクリックでコード配置）"
                            className="w-full border-none bg-transparent text-sm text-slate-700 outline-none"
                          />
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addLine(section.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400 transition hover:border-primary hover:bg-indigo-50 hover:text-primary"
                    >
                      ＋ 行を追加
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => addSection("セクション", "lyrics-chord")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-transparent px-4 py-4 text-sm text-slate-400 transition hover:border-primary hover:bg-indigo-50 hover:text-primary"
            >
              <span>＋</span>
              <span>セクションを追加</span>
            </button>

            <div className="flex flex-wrap gap-2">
              {[
                "イントロ",
                "Aメロ",
                "Bメロ",
                "サビ",
                "間奏",
                "Cメロ",
                "アウトロ",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addSection(preset, "lyrics-chord")}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:border-primary hover:text-primary"
                >
                  {preset}追加
                </button>
              ))}
              <button
                type="button"
                onClick={() => addSection("コード進行", "chord-only")}
                className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                コードのみ追加
              </button>
            </div>

            {!hasSections && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
                セクションを追加して編集を開始してください。
              </div>
            )}
          </div>
        </div>

        {isPreview && (
          <aside className="w-1/2 border-l border-slate-200 bg-white px-8 py-10">
            <div className="border-b-2 border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                {song.title}
              </h2>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                <span>{song.artist || "アーティスト未設定"}</span>
                <span>Key: {song.key || "-"}</span>
                <span>BPM: {song.bpm ?? "-"}</span>
                <span>{song.timeSignature}</span>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {song.sections.map((section) => {
                const content = parseSectionContent(section.content);
                return (
                  <div key={`${section.id}-preview`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                      {section.name}
                    </p>
                    <div className="mt-3 space-y-4">
                      {content.lines.map((line) => (
                        <div key={line.id} className="space-y-1">
                          <div className="relative h-6">
                            {line.chords.map((chord) => (
                              <span
                                key={chord.id}
                                className="absolute text-sm font-semibold text-primary"
                                style={{
                                  left: `${chord.offset * 100}%`,
                                  transform: "translateX(-50%)",
                                }}
                              >
                                {chord.chord}
                              </span>
                            ))}
                          </div>
                          {section.type === "lyrics-chord" && (
                            <div className="text-sm text-slate-800">
                              {line.lyrics}
                            </div>
                          )}
                        </div>
                      ))}
                      {content.lines.length === 0 && (
                        <div className="text-sm text-slate-400">（未入力）</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-[100]" onClick={() => setDialog(null)}>
          <div
            className="absolute rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
            style={{
              left: dialog.position.x,
              top: dialog.position.y,
              width: 320,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="text"
              value={dialog.value}
              onChange={(event) =>
                setDialog({ ...dialog, value: event.target.value })
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleChordConfirm();
                }
              }}
              className="w-full rounded-lg border border-primary px-3 py-2 text-center text-lg font-semibold text-slate-900 outline-none"
            />

            <div className="mt-4 space-y-4 text-xs text-slate-500">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  コード候補
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CHORD_LIBRARY.map((chord) => (
                    <button
                      key={chord}
                      type="button"
                      onClick={() => setDialog({ ...dialog, value: chord })}
                      className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:border-primary hover:text-primary"
                    >
                      {chord}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  次のコード予測
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {NEXT_CHORDS.map((chord) => (
                    <button
                      key={chord}
                      type="button"
                      onClick={() => setDialog({ ...dialog, value: chord })}
                      className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                    >
                      {chord}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  代理コード
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SUBSTITUTE_CHORDS.map((chord) => (
                    <button
                      key={chord}
                      type="button"
                      onClick={() => setDialog({ ...dialog, value: chord })}
                      className="rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700"
                    >
                      {chord}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded-md px-3 py-2 text-xs text-slate-500 hover:bg-slate-100"
              >
                キャンセル
              </button>
              <div className="flex items-center gap-2">
                {dialog.chordId && (
                  <button
                    type="button"
                    onClick={handleChordDelete}
                    className="rounded-md border border-red-200 px-3 py-2 text-xs text-red-600"
                  >
                    削除
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleChordConfirm}
                  className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white"
                >
                  確定 (Enter)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {shareMessage && (
        <div className="fixed bottom-6 right-6 rounded-full bg-slate-900 px-4 py-2 text-xs text-white shadow-lg">
          {shareMessage}
        </div>
      )}
    </main>
  );
}
