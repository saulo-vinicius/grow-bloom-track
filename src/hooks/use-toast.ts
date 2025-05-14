
import { useState, useEffect, useRef } from "react";

// Types
export type ToastVariant = "default" | "destructive" | "success";
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: ToastVariant;
}
export type ToastOptions = Omit<Toast, "id">;
export type ToastActionElement = React.ReactElement<
  HTMLButtonElement,
  string | React.JSXElementConstructor<any>
>;

interface UseToastReturn {
  toasts: Toast[];
  toast: (options?: ToastOptions) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// Generate a unique ID for toast
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    
    // Clear auto dismiss timer for this toast
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
  };

  const addToast = (options: ToastOptions = {}) => {
    const id = generateId();
    const toast = { id, ...options };
    
    setToasts((prevToasts) => [...prevToasts, toast]);
    
    // Auto dismiss after 5 seconds (5000ms)
    const timer = setTimeout(() => {
      dismissToast(id);
    }, 5000);
    
    timersRef.current.set(id, timer);
    
    return id;
  };

  const dismissAllToasts = () => {
    setToasts([]);
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
  };

  return {
    toasts,
    toast: addToast,
    dismiss: dismissToast,
    dismissAll: dismissAllToasts,
  };
};

export const toast = (options: ToastOptions) => {
  const toastHelper = {
    open: () => {
      // This is just a placeholder as we can't directly call the hook's toast function
      // The actual toast will be handled by the component using useToast()
      console.log("Toast triggered:", options);
    },
  };
  
  // When called directly like this, we need to rely on the Toaster component
  // picking up this call via the event system
  
  // Create a custom event to communicate with the Toaster component
  const event = new CustomEvent("toast-trigger", { 
    detail: options 
  });
  
  // Dispatch the event
  document.dispatchEvent(event);
  
  return toastHelper;
};
