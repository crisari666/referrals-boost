import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  confirmEmailChange,
  getOwnProfile,
  patchOwnProfile,
  requestEmailChange,
} from "@/services/profileService";
import { refreshOwnProfile } from "@/store/authSlice";
import { useAppDispatch } from "@/store";

const OTP_LENGTH = 6;

export function ProfileAccountSection() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailStepIdle, setEmailStepIdle] = useState(true);
  const [requestingCode, setRequestingCode] = useState(false);
  const [confirmingEmail, setConfirmingEmail] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const p = await getOwnProfile();
      setName(p.name);
      setLastName(p.lastName);
      setPhone(p.phone);
      setEmail(p.email);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "No se pudo cargar el perfil.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoadingProfile(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await patchOwnProfile({ name, lastName, phone });
      await dispatch(refreshOwnProfile()).unwrap();
      toast({
        title: "Perfil actualizado",
        description: "Tus datos se guardaron correctamente.",
      });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "No se pudo guardar.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const onRequestEmailCode = async () => {
    const trimmed = newEmail.trim();
    if (trimmed.length < 3) {
      toast({
        title: "Correo",
        description: "Ingresa un correo electrónico válido.",
        variant: "destructive",
      });
      return;
    }
    setRequestingCode(true);
    try {
      await requestEmailChange(trimmed);
      setEmailStepIdle(false);
      setEmailCode("");
      toast({
        title: "Código enviado",
        description: "Revisa la bandeja del nuevo correo e ingresa el código aquí.",
      });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "No se pudo enviar el código.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setRequestingCode(false);
    }
  };

  const onConfirmEmail = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim();
    if (emailCode.trim().length !== OTP_LENGTH) {
      toast({
        title: "Código",
        description: `El código debe tener ${OTP_LENGTH} dígitos.`,
        variant: "destructive",
      });
      return;
    }
    setConfirmingEmail(true);
    try {
      await confirmEmailChange({ newEmail: trimmed, code: emailCode.trim() });
      await dispatch(refreshOwnProfile()).unwrap();
      await loadProfile();
      setNewEmail("");
      setEmailCode("");
      setEmailStepIdle(true);
      toast({
        title: "Correo actualizado",
        description: "Tu correo de acceso se actualizó correctamente.",
      });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "No se pudo confirmar el correo.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setConfirmingEmail(false);
    }
  };

  if (loadingProfile) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Cargando datos…</span>
      </section>
    );
  }

  return (
    <section>
      <div>
        <h2 className="text-lg font-semibold text-foreground">Datos de cuenta</h2>
        <p className="text-sm text-muted-foreground">Nombre, teléfono y correo de contacto</p>
      </div>

      <form onSubmit={onSaveProfile} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Nombre</Label>
          <Input
            id="profile-name"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-lastname">Apellido</Label>
          <Input
            id="profile-lastname"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-phone">Teléfono de contacto</Label>
          <Input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          disabled={savingProfile}
          variant="secondary"
          className="cursor-pointer"
        >
          {savingProfile ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Guardando…
            </>
          ) : (
            "Guardar datos"
          )}
        </Button>
      </form>

      <div className="border-t border-border pt-6 space-y-4 max-w-md">
        <div className="space-y-1">
          <Label>Correo actual</Label>
          <p className="text-sm text-foreground font-medium">{email}</p>
        </div>

        <form onSubmit={onConfirmEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-new-email">Nuevo correo</Label>
            <Input
              id="profile-new-email"
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nuevo@correo.com"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={requestingCode || newEmail.trim().length < 3}
            onClick={() => void onRequestEmailCode()}
            className="cursor-pointer"
          >
            {requestingCode ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Enviando…
              </>
            ) : (
              "Enviar código de verificación"
            )}
          </Button>

          {!emailStepIdle ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="profile-email-code">Código del correo nuevo</Label>
                <Input
                  id="profile-email-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={OTP_LENGTH}
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                  placeholder={"0".repeat(OTP_LENGTH)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={confirmingEmail || emailCode.length !== OTP_LENGTH}
                  className="cursor-pointer gradient-commission text-primary-foreground"
                >
                  {confirmingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Confirmando…
                    </>
                  ) : (
                    "Confirmar nuevo correo"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() => {
                    setEmailStepIdle(true);
                    setEmailCode("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </>
          ) : null}
        </form>
      </div>
    </section>
  );
}
