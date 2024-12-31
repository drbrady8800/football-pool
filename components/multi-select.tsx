"use client"

import * as React from "react"
import { X, CheckIcon, XIcon, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

interface MultiSelectProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export default function MultiSelectClient({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedOptions = React.useMemo(() => 
    options.filter(opt => selected.includes(opt.value))
  , [options, selected])
  
  const displayCount = 5
  const remainingCount = Math.max(0, selectedOptions.length - displayCount)

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value))
  }

  const handleSelectAll = () => {
    onChange(options.map(opt => opt.value))
  }

  const handleClearAll = () => {
    onChange([])
  }

  // Handle clicking outside
  const commandRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  return (
    <Command 
      ref={commandRef}
      className={`overflow-visible bg-transparent ${className ?? ""}`}
    >
      <div
        className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <div className="flex gap-1 flex-wrap items-center">
          {selectedOptions.slice(0, displayCount).map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="hover:bg-secondary/80"
            >
              {option.label}
              <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(option.value)
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleUnselect(option.value)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="secondary">+{remainingCount} more</Badge>
          )}
          <div 
            className="flex-1 min-w-20"
            onClick={() => {
              inputRef.current?.focus()
            }}
          >
            <div className="flex items-center gap-1">
              <Plus className="h-4 w-4 shrink-0 opacity-50" />
              <CommandPrimitive.Input
                ref={inputRef}
                placeholder={placeholder}
                className="flex h-8 max-w-48 rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                onFocus={() => setOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>
      {open && (
        <div className="relative mt-2">
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <div className="flex items-center gap-2 p-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={(e) => {
                  e.preventDefault()
                  handleSelectAll()
                }}
              >
                <CheckIcon className="mr-2 h-3 w-3" />
                Select All
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={(e) => {
                  e.preventDefault()
                  handleClearAll()
                }}
              >
                <XIcon className="mr-2 h-3 w-3" />
                Clear All
              </Button>
            </div>
            <CommandList>
              <CommandGroup>
                {options.map((option) => {
                  console.log(option)
                  const isSelected = selected.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onChange(
                          isSelected
                            ? selected.filter((s) => s !== option.value)
                            : [...selected, option.value]
                        )
                        // Keep the dropdown open after selection
                        inputRef.current?.focus()
                      }}
                    >
                      <Checkbox checked={isSelected} />
                      {option.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </div>
        </div>
      )}
    </Command>
  )
}
