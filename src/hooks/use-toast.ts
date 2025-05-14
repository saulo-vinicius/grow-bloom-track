
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import { useToast as useToastFromRadix } from "@/components/ui/toast";

export const useToast = useToastFromRadix;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export const toast = {
  success: (message: string) => {
    const { toast } = useToast();
    toast({
      description: message,
      variant: "default",
      className: "bg-green-500 text-white",
    });
  },
  error: (message: string) => {
    const { toast } = useToast();
    toast({
      description: message,
      variant: "destructive",
    });
  },
};
