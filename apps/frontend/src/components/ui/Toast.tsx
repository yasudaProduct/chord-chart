type ToastProps = {
  message: string
  visible: boolean
}

export const Toast = ({ message, visible }: ToastProps) => {
  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 rounded-full bg-slate-900 px-4 py-2 text-xs text-white shadow-lg">
      {message}
    </div>
  )
}
