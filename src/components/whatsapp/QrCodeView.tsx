import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { requestQrCode, syncConnection, setScanning } from "@/store/whatsappSlice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw, Smartphone, CheckCircle2, XCircle, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WhatsappSocketListener from "@/components/whatsapp/WhatsappSocketListener";
import QRCode from "react-qr-code"

const QrCodeView = () => {
  const dispatch = useAppDispatch();
  const { connectionStatus, qrCode, errorMessage } = useAppSelector((s) => s.whatsapp);
  const phone = useAppSelector((s) => s.auth.user?.phone);

  useEffect(() => {
    if (connectionStatus === "disconnected") {
      dispatch(requestQrCode(phone));
    }
  }, [dispatch, connectionStatus, phone]);

  const handleScanStarted = () => {
    dispatch(setScanning());
  };

  const handleSync = () => {
    dispatch(syncConnection());
  };

  const handleRetry = () => {
    dispatch(requestQrCode(phone));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
      <WhatsappSocketListener sessionId={phone ?? null} />
      <AnimatePresence mode="wait">
        {/* LOADING QR */}
        {connectionStatus === "qr_loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Solicitando código QR...</p>
          </motion.div>
        )}

        {/* QR READY */}
        {connectionStatus === "qr_ready" && qrCode && (
          <motion.div key="qr" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 text-foreground">
              <Smartphone className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Escanea el código QR</h2>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Abre WhatsApp en tu teléfono → Dispositivos vinculados → Vincular un dispositivo
            </p>
            <Card className="p-4 bg-card border-2 border-primary/20">
              <QRCode value={qrCode} size={220} color="red" bgColor="GrayText" fgColor="white" />
            </Card>
            <Button onClick={handleScanStarted} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Ya escaneé el código
            </Button>
            <Button variant="ghost" onClick={handleRetry} className="gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
              Generar nuevo código
            </Button>
          </motion.div>
        )}

        {/* SCANNING */}
        {connectionStatus === "scanning" && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-foreground font-bold text-lg">Esperando sincronización...</p>
            <p className="text-sm text-muted-foreground">Verificando la conexión con WhatsApp</p>
            <Button onClick={handleSync} className="gap-2">
              <Wifi className="w-4 h-4" />
              Sincronizar ahora
            </Button>
          </motion.div>
        )}

        {/* CONNECTING */}
        {connectionStatus === "connecting" && (
          <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
            <p className="text-foreground font-bold text-lg">Conectando...</p>
            <p className="text-sm text-muted-foreground">Estableciendo sesión con WhatsApp</p>
          </motion.div>
        )}

        {/* ERROR */}
        {connectionStatus === "error" && (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
            <XCircle className="w-12 h-12 text-destructive" />
            <p className="text-foreground font-bold text-lg">Error de sincronización</p>
            <p className="text-sm text-destructive text-center max-w-sm">{errorMessage}</p>
            <Button onClick={handleRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QrCodeView;
