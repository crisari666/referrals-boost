import { MapPin, Layers, Share2, Download, Video, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Project } from "@/data/mockData";

const LABELS = {
  ubicacion: "Ubicación",
  descripcion: "Descripción",
  desde: "Desde",
  comision: "Comisión",
  valorComision: "Valor comisión",
  lotes: "Lotes disponibles",
  amenidades: "Amenidades",
  compartirWhatsApp: "Compartir por WhatsApp",
  descargarVideo: "Descargar Video",
  descargarPdf: "Descargar PDF",
} as const;

interface ProjectDetailModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectDetailModal = ({ project, open, onOpenChange }: ProjectDetailModalProps) => {
  if (!project) return null;

  const whatsappMsg = encodeURIComponent(
    `¡Hola! 👋 Te comparto información sobre *${project.title}* en ${project.location}. Lotes desde $${project.priceFrom.toLocaleString()}. ¿Te interesa saber más?`
  );
  const commissionValue =
    project.commissionType === "%"
      ? Math.round(project.priceFrom * project.commission / 100)
      : project.commission;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left pr-8">{project.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {project.image && (
            <div className="rounded-xl overflow-hidden h-44 -mx-1">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{LABELS.ubicacion}: {project.location}</span>
          </div>
          {project.description && (
            <>
              <p className="text-xs font-medium text-muted-foreground">{LABELS.descripcion}</p>
              <p className="text-sm text-foreground leading-relaxed">{project.description}</p>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">{LABELS.desde}</p>
              <p className="font-extrabold text-foreground text-sm">
                ${project.priceFrom.toLocaleString()}
              </p>
            </div>
            <div className="bg-primary/10 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">{LABELS.comision}</p>
              <p className="font-extrabold text-primary text-sm">
                {project.commissionType === "%" ? `${project.commission}%` : `$${project.commission.toLocaleString()}`}
              </p>
            </div>
            <div className="bg-accent/10 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">{LABELS.valorComision}</p>
              <p className="font-extrabold text-foreground text-sm">
                COP {commissionValue.toLocaleString("es-CO")}
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">{LABELS.lotes}</p>
              <p className="font-extrabold text-foreground text-sm flex items-center justify-center gap-1">
                <Layers className="w-3 h-3" />
                {project.lotsAvailable} de {project.totalLots}
              </p>
            </div>
          </div>
          {project.amenities.length > 0 && (
            <>
              <p className="text-xs font-medium text-muted-foreground">{LABELS.amenidades}</p>
              <div className="grid grid-cols-2 gap-2">
                {project.amenities.map((am) => (
                  <div key={am} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                    {am}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={`https://wa.me/?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 gradient-success text-primary-foreground font-bold py-3 rounded-xl text-sm"
            >
              <Share2 className="w-4 h-4" /> {LABELS.compartirWhatsApp}
            </a>
            <Button variant="outline" className="rounded-xl py-3 h-auto">
              <Video className="w-4 h-4 mr-2" /> {LABELS.descargarVideo}
            </Button>
            <Button variant="outline" className="rounded-xl py-3 h-auto col-span-2">
              <Download className="w-4 h-4 mr-2" /> {LABELS.descargarPdf}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailModal;
