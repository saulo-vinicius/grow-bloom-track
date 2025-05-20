
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, value, ...props }, ref) => {
    // Handle input change for decimal values with controlled component approach
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // If this is a number input or has inputMode="decimal"
      if ((type === 'number' || props.inputMode === 'decimal') && e.target.value.includes(',')) {
        // Create a copy of the event with comma replaced by period
        const fixedValue = e.target.value.replace(/,/g, '.');
        
        // Create a new synthetic event
        const syntheticEvent = Object.create(e);
        syntheticEvent.target = { ...e.target, value: fixedValue };
        
        // Call the original onChange handler with the modified event
        if (onChange) {
          onChange(syntheticEvent);
        }
      } else if (onChange) {
        // Call the original onChange handler for non-decimal inputs
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
        {...props}
        value={value}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
