import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type ProjectDetailModalLabels = {
  ubicacion: string;
  desde: string;
  comision: string;
  valorComision: string;
  lotes: string;
  recursos: string;
  videos: string;
  imagenes: string;
  imagen: string;
  brochure: string;
  planoPdf: string;
  documentosLegales: string;
  seleccionarDocumentoLegal: string;
  compartir: string;
  descargar: string;
  seleccionarImagen: string;
  compartirWhatsApp: string;
  vistaPrevia: string;
  preparandoParaCompartir: string;
  listoParaCompartir: string;
  errorPrepararCompartir: string;
  errorPrepararCompartirDesc: string;
};

/**
 * Localized labels for project detail modal sections.
 */
export function useProjectDetailModalLabels(): ProjectDetailModalLabels {
  const { t } = useTranslation();
  return useMemo(
    (): ProjectDetailModalLabels => ({
      ubicacion: t("projects.modalLocation"),
      desde: t("projects.modalFrom"),
      comision: t("projects.modalCommission"),
      valorComision: t("projects.modalCommissionValue"),
      lotes: t("projects.modalLots"),
      recursos: t("projects.modalResources"),
      videos: t("projects.modalVideos"),
      imagenes: t("projects.modalImages"),
      imagen: t("projects.modalImage"),
      brochure: t("projects.modalBrochure"),
      planoPdf: t("projects.modalPdf"),
      documentosLegales: t("projects.legalDocuments"),
      seleccionarDocumentoLegal: t("projects.legalDocumentsSelect"),
      compartir: t("projects.modalShare"),
      descargar: t("projects.modalDownload"),
      seleccionarImagen: t("projects.modalSelectImage"),
      compartirWhatsApp: t("projects.modalShareWhatsapp"),
      vistaPrevia: t("projects.modalPreview"),
      preparandoParaCompartir: t("projects.modalPreparingShare"),
      listoParaCompartir: t("projects.modalReadyShare"),
      errorPrepararCompartir: t("projects.modalSharePrepareError"),
      errorPrepararCompartirDesc: t("projects.modalSharePrepareErrorDesc"),
    }),
    [t],
  );
}
