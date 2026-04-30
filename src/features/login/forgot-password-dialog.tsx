import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearForgotPasswordState, requestForgotPassword } from "@/store/authSlice";

type ForgotPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const forgotPasswordIsLoading = useAppSelector((s) => s.auth.forgotPasswordIsLoading);
  const forgotPasswordError = useAppSelector((s) => s.auth.forgotPasswordError);
  const forgotPasswordSubmitted = useAppSelector((s) => s.auth.forgotPasswordSubmitted);

  useEffect(() => {
    if (open) {
      dispatch(clearForgotPasswordState());
      setEmail("");
    }
  }, [open, dispatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(requestForgotPassword({ email }));
  };

  const handleClose = () => {
    dispatch(clearForgotPasswordState());
    setEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("auth.forgotTitle")}</DialogTitle>
          <DialogDescription>{t("auth.forgotDescription")}</DialogDescription>
        </DialogHeader>
        {forgotPasswordSubmitted ? (
          <p className="text-sm text-foreground leading-relaxed">{t("auth.forgotPasswordSuccess")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">{t("auth.forgotEmailLabel")}</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.forgotEmailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={forgotPasswordIsLoading}
              />
            </div>
            {forgotPasswordError ? (
              <Alert variant="destructive">
                <AlertDescription>{forgotPasswordError}</AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose} disabled={forgotPasswordIsLoading}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={forgotPasswordIsLoading} className="cursor-pointer">
                {forgotPasswordIsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t("common.sending")}
                  </>
                ) : (
                  t("common.send")
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
        {forgotPasswordSubmitted ? (
          <DialogFooter>
            <Button type="button" onClick={handleClose} className="w-full sm:w-auto cursor-pointer">
              {t("common.close")}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
