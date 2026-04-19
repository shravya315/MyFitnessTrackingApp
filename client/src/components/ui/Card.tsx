import React from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 ${className}`}>
      {children}
    </div>
  )
}

export default Card