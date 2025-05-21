
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, value, ...props }, ref) => {
    // Handle input change for decimal values with proper controlled component approach
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Check if this is a number input or has inputMode="decimal"
      if ((type === 'number' || props.inputMode === 'decimal') && onChange) {
        // If the value contains a comma, replace it with a period
        if (e.target.value.includes(',')) {
          // Create a new synthetic event with the modified value
          const newEvent = Object.create(e);
          newEvent.target = { ...e.target, value: e.target.value.replace(/,/g, '.') };
          // Call the original onChange handler with the modified event
          onChange(newEvent);
        } else {
          // If no comma, just pass the original event
          onChange(e);
        }
      } else if (onChange) {
        // For non-decimal inputs, call the original onChange handler
        onChange(e);
      }
    };
    
    return (
      <input
        type={type === 'number' ? 'text' : type} // Always use text for number inputs for better decimal handling
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onChange={handleChange}
        ref={ref}
        inputMode={type === 'number' ? 'decimal' : props.inputMode}
        pattern={type === 'number' ? '[0-9]*[.]?[0-9]*' : props.pattern}
        {...props}
        value={value}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
