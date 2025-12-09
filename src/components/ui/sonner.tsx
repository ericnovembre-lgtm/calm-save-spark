import { useResolvedTheme } from "@/lib/theme";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useResolvedTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-sm",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-green-500/20 group-[.toaster]:bg-green-50 dark:group-[.toaster]:bg-green-950/20",
          error: "group-[.toaster]:border-red-500/20 group-[.toaster]:bg-red-50 dark:group-[.toaster]:bg-red-950/20",
          info: "group-[.toaster]:border-amber-500/20 group-[.toaster]:bg-amber-50 dark:group-[.toaster]:bg-amber-950/20",
          warning: "group-[.toaster]:border-amber-500/20 group-[.toaster]:bg-amber-50 dark:group-[.toaster]:bg-amber-950/20",
        },
        duration: 4000,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
