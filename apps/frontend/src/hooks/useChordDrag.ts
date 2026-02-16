import { useEffect, useState } from 'react'
import { useEditorActions } from './useEditorActions'

type DragChordState = {
  sectionId: string
  lineId: string
  chordId: string
  rect: DOMRect
  startX: number
  moved: boolean
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value))

export const useChordDrag = () => {
  const [draggingChord, setDraggingChord] = useState<DragChordState | null>(
    null
  )
  const { updateChordOffset, findLine, openDialog } = useEditorActions()

  useEffect(() => {
    if (!draggingChord) return

    const handleMove = (event: PointerEvent) => {
      setDraggingChord((prev) => {
        if (!prev) return prev
        const offset = clamp(
          (event.clientX - prev.rect.left) / prev.rect.width
        )
        updateChordOffset(prev.sectionId, prev.lineId, prev.chordId, offset)
        return {
          ...prev,
          moved: prev.moved || Math.abs(event.clientX - prev.startX) > 3,
        }
      })
    }

    const handleUp = () => {
      setDraggingChord((prev) => {
        if (prev && !prev.moved) {
          const targetLine = findLine(prev.sectionId, prev.lineId)
          const chord = targetLine?.chords.find(
            (item) => item.id === prev.chordId
          )
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
            })
          }
        }
        return null
      })
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [draggingChord, updateChordOffset, findLine, openDialog])

  const startChordDrag = (state: DragChordState) => {
    setDraggingChord(state)
  }

  return { draggingChord, startChordDrag }
}
