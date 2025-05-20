import  * as React from "react"

export const ChartContainer = ({ children }) => {
  return <div className="w-full">{children}</div>
}

export const Chart = ({ children }) => {
  return <div className="w-full">{children}</div>
}

export const ChartLegend = ({ children }) => {
  return <div className="mt-4 flex justify-center">{children}</div>
}

export const ChartTooltip = ({ className }) => {
  return <div className={className}></div>
}
