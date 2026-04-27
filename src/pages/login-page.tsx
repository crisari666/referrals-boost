import { LoginForm } from "@/features/login/login-form";
import { LoginErrorDialog } from "@/features/login/login-error-dialog";
import { useLoginPage } from "@/features/login/use-login-page";

const LoginPage = () => {
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
    </div>
  );
};

export default LoginPage;
