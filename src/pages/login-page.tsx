import { motion } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-8"
      >
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
      </motion.div>

      <LoginErrorDialog
        open={Boolean(error)}
        message={error}
        onOpenChange={(open) => {
          if (!open) dismissError();
        }}
      />
    </div>
  );
};

export default LoginPage;
