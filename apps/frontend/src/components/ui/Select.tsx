import { cn } from '@/lib/utils'

type SelectOption = {
  value: string
  label: string
}

type SelectProps = {
  label?: string
  options: readonly SelectOption[] | readonly string[]
  className?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = ({ label, options, className, ...rest }: SelectProps) => {
  const select = (
    <select
      className={cn(
        'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary',
        className
      )}
      {...rest}
    >
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.value
        const optionLabel = typeof option === 'string' ? option : option.label
        return (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        )
      })}
    </select>
  )

  if (!label) return select

  return (
    <label className="text-xs font-medium text-slate-500">
      {label}
      <div className="mt-2">{select}</div>
    </label>
  )
}
