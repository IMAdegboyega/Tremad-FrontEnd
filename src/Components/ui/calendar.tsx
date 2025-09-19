"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/Components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-white rounded-2xl p-0 w-full",
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatCaption: (date: Date) => {
          return date.toLocaleString("default", { 
            month: "long", 
            day: "numeric",
            weekday: "long"
          })
        },
        formatWeekdayName: (date: Date) => {
          return date.toLocaleString("default", { weekday: "short" })
        },
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-3", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "h-7 w-7 bg-transparent opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-lg p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "h-7 w-7 bg-transparent opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-lg p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-10 w-full px-8 mb-2",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-10 gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-semibold text-gray-900 text-base",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex mb-1 justify-between w-full", defaultClassNames.weekdays),
        weekday: cn(
          "text-gray-400 rounded-md flex-1 font-normal text-xs select-none text-center flex items-center justify-center w-9",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-1 justify-between", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-9",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-xs select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-full",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-full", defaultClassNames.range_end),
        today: cn(
          "rounded-full",
          defaultClassNames.today
        ),
        outside: cn(
          "text-gray-300 aria-selected:text-gray-300",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-gray-300 opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4 text-gray-600", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4 text-gray-600", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4 text-gray-600", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-9 items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  // Check if this is the specific dates that should be highlighted
  const dayNumber = day.date.getDate()
  const monthNumber = day.date.getMonth()
  const currentMonth = new Date().getMonth()
  
  // Only highlight dates in the current month
  const isCurrentMonth = monthNumber === currentMonth
  const isGreenHighlight = isCurrentMonth && dayNumber === 7  // Green circle for 7th
  const isRedHighlight = isCurrentMonth && dayNumber === 12   // Red circle for 12th
  const isPinkHighlight = isCurrentMonth && dayNumber === 19  // Pink circle for 19th
  const isBlueHighlight = isCurrentMonth && dayNumber === 21  // Blue for 21st
  const isPurpleHighlight = isCurrentMonth && dayNumber === 30 // Purple for 30th

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square size-9 w-9 h-9 min-w-9 flex-col gap-0 leading-none font-normal rounded-full hover:bg-gray-50 transition-colors text-sm relative",
        // Today's date styling
        modifiers.today && "font-semibold text-gray-900",
        // Selected date styling
        modifiers.selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        // Outside month dates
        modifiers.outside && "text-gray-300",
        // Custom highlights for specific dates
        isGreenHighlight && "bg-green-100 text-green-700 hover:bg-green-200",
        isRedHighlight && "bg-red-100 text-red-700 hover:bg-red-200",
        isPinkHighlight && "bg-pink-100 text-pink-700 hover:bg-pink-200",
        isBlueHighlight && "bg-blue-100 text-blue-700 hover:bg-blue-200",
        isPurpleHighlight && "bg-purple-100 text-purple-700 hover:bg-purple-200",
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      <span className="text-xs">{day.date.getDate()}</span>
      {/* Add event indicators if needed */}
      {(isGreenHighlight || isRedHighlight || isPinkHighlight || isBlueHighlight || isPurpleHighlight) && (
        <span className="absolute bottom-1 w-1 h-1 rounded-full" 
          style={{
            backgroundColor: isGreenHighlight ? '#10b981' : 
                           isRedHighlight ? '#ef4444' : 
                           isPinkHighlight ? '#ec4899' :
                           isBlueHighlight ? '#3b82f6' :
                           '#9333ea'
          }}
        />
      )}
    </Button>
  )
}

export { Calendar, CalendarDayButton }