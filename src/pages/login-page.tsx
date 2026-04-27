import { useState } from "react";
import { LoginForm } from "@/features/login/login-form";
import { LoginErrorDialog } from "@/features/login/login-error-dialog";
import { ForgotPasswordDialog } from "@/features/login/forgot-password-dialog";
import { useLoginPage } from "@/features/login/use-login-page";
import { Button } from "@/components/ui/button";

const LoginPage = () => {
  const [forgotOpen, setForgotOpen] = useState(false);
  const {
    userOrEmail,
    setUserOrEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleSubmit,
    dismissError,
  } = useLoginPage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground">
            La<span className="text-primary">Ceiba</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa con tus credenciales de vendedor
          </p>
        </div>

        <LoginForm
          userOrEmail={userOrEmail}
          password={password}
          isLoading={isLoading}
          onUserOrEmailChange={setUserOrEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
        />

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            className="text-sm text-primary h-auto p-0 cursor-pointer"
            onClick={() => setForgotOpen(true)}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>Ingresa usuario o correo y contraseña para acceder</p>
        </div>
      </div>
      {error ? (
        <LoginErrorDialog
          open
          message={error}
          onOpenChange={(open) => {
            if (!open) dismissError();
          }}
        />
      ) : null}
      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
    </div>
  );
};

export default LoginPage;
