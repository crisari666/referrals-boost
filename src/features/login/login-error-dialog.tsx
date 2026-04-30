import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type LoginErrorDialogProps = {
  open: boolean;
  message: string | null;
  onOpenChange: (open: boolean) => void;
};

export function LoginErrorDialog({ open, message, onOpenChange }: LoginErrorDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            {t("auth.loginErrorTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-foreground">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>{t("auth.loginErrorOk")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
