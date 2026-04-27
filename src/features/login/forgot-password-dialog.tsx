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
import { useAppDispatch, useAppSelector } from "@/store";
import {
  clearForgotPasswordState,
  FORGOT_PASSWORD_SUCCESS_MESSAGE,
  requestForgotPassword,
} from "@/store/authSlice";

type ForgotPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
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
          <DialogTitle>Recuperar contraseña</DialogTitle>
          <DialogDescription>
            Ingresa el correo con el que registraste tu cuenta de vendedor.
          </DialogDescription>
        </DialogHeader>
        {forgotPasswordSubmitted ? (
          <p className="text-sm text-foreground leading-relaxed">{FORGOT_PASSWORD_SUCCESS_MESSAGE}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Correo electrónico</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="correo@ejemplo.com"
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
                Cancelar
              </Button>
              <Button type="submit" disabled={forgotPasswordIsLoading} className="cursor-pointer">
                {forgotPasswordIsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Enviando…
                  </>
                ) : (
                  "Enviar"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
        {forgotPasswordSubmitted ? (
          <DialogFooter>
            <Button type="button" onClick={handleClose} className="w-full sm:w-auto cursor-pointer">
              Cerrar
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
