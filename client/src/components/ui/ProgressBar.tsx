import React from "react"

interface Props {
  value: number
  max: number
}

const ProgressBar: React.FC<Props> = ({ value, max }) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-500 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export default ProgressBar