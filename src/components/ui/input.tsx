
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, ...props }, ref) => {
    // Special handling for number inputs to allow commas
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === 'number' && e.target.value.includes(',')) {
        // Replace commas with dots for number inputs
        const value = e.target.value.replace(/,/g, '.');
        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        if (onChange) onChange(newEvent);
      } else if (onChange) {
        onChange(e);
      }
    };
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onChange={handleInputChange}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
