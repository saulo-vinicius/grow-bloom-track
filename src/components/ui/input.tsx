
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, onBlur, ...props }, ref) => {
    // Special handling for number and text inputs to handle decimal inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Keep the original value with commas for display
      const originalValue = e.target.value;
      
      // For text inputs with inputMode="decimal" or number inputs, ensure decimal handling
      if ((type === 'number' || props.inputMode === 'decimal') && originalValue.includes(',')) {
        // Create a copy of the event with the modified value for processing
        const processedValue = originalValue.replace(/,/g, '.');
        
        // Create a new synthetic event with the modified value
        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value: processedValue
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        if (onChange) onChange(newEvent);
        
        // Important: Set back the display value to maintain user's input format
        setTimeout(() => {
          if (e.target) {
            e.target.value = originalValue;
          }
        }, 0);
      } else if (onChange) {
        onChange(e);
      }
    };

    // Handle blur event for validation
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if ((type === 'number' || props.inputMode === 'decimal') && e.target.value) {
        // Ensure correct decimal format when leaving the field
        let value = e.target.value.replace(/,/g, '.');
        
        // If it's a valid number, process it
        if (!isNaN(parseFloat(value))) {
          // For internal processing, we use the value with dots
          const displayValue = e.target.value; // Keep display value as entered
          
          // Create a new event with processed value
          const newEvent = {
            ...e,
            target: {
              ...e.target,
              value
            }
          } as React.FocusEvent<HTMLInputElement>;
          
          // Call original onBlur with processed value
          if (onBlur) onBlur(newEvent);
          
          // Restore display value
          setTimeout(() => {
            if (e.target) {
              e.target.value = displayValue;
            }
          }, 0);
          
          return;
        }
      }
      
      // Call original onBlur for non-numeric fields
      if (onBlur) onBlur(e);
    };
    
    return (
      <input
        type={type === 'number' ? 'text' : type} // Convert number inputs to text for better handling
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
