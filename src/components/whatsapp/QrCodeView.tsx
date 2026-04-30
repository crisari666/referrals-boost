import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { requestQrCode, syncConnection, setScanning } from "@/store/whatsappSlice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw, Smartphone, CheckCircle2, XCircle, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";

const QrCodeView = () => {
  const { t } = useTranslation();
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
    if (phone) dispatch(syncConnection(phone));
  };
  const handleRetry = () => {
    dispatch(requestQrCode(phone));
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
      <AnimatePresence mode="wait">
        {connectionStatus === "qr_loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">{t("whatsapp.qrRequesting")}</p>
          </motion.div>
        )}
        {connectionStatus === "qr_ready" && qrCode && (
          <motion.div key="qr" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 text-foreground">
              <Smartphone className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">{t("whatsapp.qrScanTitle")}</h2>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {t("whatsapp.qrScanSteps")}
            </p>
            <Card className="p-4 bg-card border-2 border-primary/20">
              <QRCode value={qrCode} size={220} color="white" bgColor="black" fgColor="red" />
            </Card>
            <Button onClick={handleScanStarted} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {t("whatsapp.qrScannedButton")}
            </Button>
            <Button variant="ghost" onClick={handleRetry} className="gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
              {t("whatsapp.qrRegenerate")}
            </Button>
          </motion.div>
        )}
        {connectionStatus === "scanning" && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-foreground font-bold text-lg">{t("whatsapp.scanningTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("whatsapp.scanningSubtitle")}</p>
            <Button onClick={handleSync} className="gap-2">
              <Wifi className="w-4 h-4" />
              {t("whatsapp.syncNow")}
            </Button>
          </motion.div>
        )}
        {connectionStatus === "connecting" && (
          <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
            <p className="text-foreground font-bold text-lg">{t("whatsapp.connectingTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("whatsapp.connectingSubtitle")}</p>
          </motion.div>
        )}
        {connectionStatus === "error" && (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
            <XCircle className="w-12 h-12 text-destructive" />
            <p className="text-foreground font-bold text-lg">{t("whatsapp.syncErrorTitle")}</p>
            <p className="text-sm text-destructive text-center max-w-sm">{errorMessage}</p>
            <Button onClick={handleRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {t("whatsapp.retry")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QrCodeView;
