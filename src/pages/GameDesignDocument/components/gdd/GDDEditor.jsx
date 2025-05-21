import React from "react"
import { useState, useEffect, useRef } from "react"

export function GDDEditor({ content, onChange }) {
  const [value, setValue] = useState(content)
  const textareaRef = useRef(null)

  useEffect(() => {
    setValue(content)
  }, [content])

  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current)
    }
  }, [value])

  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange(newValue)
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      className="font-mono text-sm p-4 w-full min-h-[200px] bg-white resize-none overflow-hidden"
      placeholder="Start writing your GDD section here..."
    />
  )
}
