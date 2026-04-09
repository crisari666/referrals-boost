import { type FormEvent } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  userOrEmail: string;
  password: string;
  isLoading: boolean;
  onUserOrEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export function LoginForm({
  userOrEmail,
  password,
  isLoading,
  onUserOrEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="userOrEmail">Usuario o correo</Label>
        <Input
          id="userOrEmail"
          type="text"
          placeholder="Usuario o correo electrónico"
          value={userOrEmail}
          onChange={(e) => onUserOrEmailChange(e.target.value)}
          required
          autoComplete="username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      <Button
        type="submit"
        className="w-full gradient-commission text-primary-foreground"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <LogIn className="w-4 h-4 mr-2" />
        )}
        {isLoading ? "Verificando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
