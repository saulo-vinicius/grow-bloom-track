import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, onBlur, ...props }, ref) => {
    // Special handling for number and text inputs to allow commas
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // For text inputs with inputMode="decimal" or number inputs, handle comma-to-dot conversion
      if ((type === 'number' || props.inputMode === 'decimal') && e.target.value.includes(',')) {
        // Replace commas with dots for decimal inputs, but keep the original display
        const originalValue = e.target.value;
        const value = originalValue.replace(/,/g, '.');
        
        // Create a new synthetic event with the modified value
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

    // Handle blur event for extra validation on decimals
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if ((type === 'number' || props.inputMode === 'decimal') && e.target.value) {
        // Ensure valid decimal format when leaving the field
        let value = e.target.value.replace(/,/g, '.');
        
        // If it's a valid number, format it
        if (!isNaN(parseFloat(value))) {
          e.target.value = value;
        }
      }
      
      // Call original onBlur if provided
      if (onBlur) onBlur(e);
    };
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onChange={handleInputChange}
        onBlur={handleBlur}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
