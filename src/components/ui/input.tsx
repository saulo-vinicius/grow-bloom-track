
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, ...props }, ref) => {
    // Handle input change for decimal values
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // If this is a number input or has inputMode="decimal"
      if ((type === 'number' || props.inputMode === 'decimal') && e.target.value.includes(',')) {
        // Replace commas with periods for decimal values
        const fixedValue = e.target.value.replace(/,/g, '.');
        
        // Update the input field value directly
        e.target.value = fixedValue;
      }
      
      // Call the original onChange handler
      if (onChange) {
        onChange(e);
      }
    };
    
    return (
      <input
        type={type === 'number' ? 'text' : type} // Convert number inputs to text for better decimal handling
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
