import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          : t("profile.apiProfileLoadFailed");
      toast({ title: t("common.errorTitle"), description: msg, variant: "destructive" });
    } finally {
      setLoadingProfile(false);
    }
  }, [toast, t]);
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
        title: t("profile.accountProfileUpdated"),
        description: t("profile.accountProfileUpdatedDesc"),
      });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : t("profile.accountSaveFailed");
      toast({ title: t("common.errorTitle"), description: msg, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };
  const onRequestEmailCode = async () => {
    const trimmed = newEmail.trim();
    if (trimmed.length < 3) {
      toast({
        title: t("profile.accountEmailLabel"),
        description: t("profile.accountEmailInvalid"),
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
        title: t("profile.accountCodeSentTitle"),
        description: t("profile.accountCodeSentDesc"),
      });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : t("profile.accountCodeSendFailed");
      toast({ title: t("common.errorTitle"), description: msg, variant: "destructive" });
    } finally {
      setRequestingCode(false);
    }
  };
  const onConfirmEmail = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim();
    if (emailCode.trim().length !== OTP_LENGTH) {
      toast({
        title: t("profile.accountCodeTitle"),
        description: t("profile.accountCodeLengthDesc", { count: OTP_LENGTH }),
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
        title: t("profile.accountEmailUpdatedTitle"),
        description: t("profile.accountEmailUpdatedDesc"),
      });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : t("profile.accountEmailConfirmFailed");
      toast({ title: t("common.errorTitle"), description: msg, variant: "destructive" });
    } finally {
      setConfirmingEmail(false);
    }
  };
  if (loadingProfile) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{t("profile.accountLoading")}</span>
      </section>
    );
  }
  return (
    <section>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t("profile.accountSectionTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("profile.accountSectionSubtitle")}</p>
      </div>
      <form onSubmit={onSaveProfile} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="profile-name">{t("profile.accountLabelName")}</Label>
          <Input
            id="profile-name"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-lastname">{t("profile.accountLabelLastName")}</Label>
          <Input
            id="profile-lastname"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-phone">{t("profile.accountLabelPhone")}</Label>
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
              {t("common.saving")}
            </>
          ) : (
            t("profile.accountSaveData")
          )}
        </Button>
      </form>
      <div className="border-t border-border pt-6 space-y-4 max-w-md">
        <div className="space-y-1">
          <Label>{t("profile.accountCurrentEmail")}</Label>
          <p className="text-sm text-foreground font-medium">{email}</p>
        </div>
        <form onSubmit={onConfirmEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-new-email">{t("profile.accountNewEmail")}</Label>
            <Input
              id="profile-new-email"
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={t("profile.accountNewEmailPlaceholder")}
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
                {t("common.sending")}
              </>
            ) : (
              t("profile.accountSendVerificationCode")
            )}
          </Button>
          {!emailStepIdle ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="profile-email-code">{t("profile.accountNewEmailCodeLabel")}</Label>
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
                      {t("profile.accountConfirming")}
                    </>
                  ) : (
                    t("profile.accountConfirmEmail")
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
                  {t("common.cancel")}
                </Button>
              </div>
            </>
          ) : null}
        </form>
      </div>
    </section>
  );
}
