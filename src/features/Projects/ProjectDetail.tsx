import { useParams, Link } from "react-router-dom";
import { useAppSelector } from "@/store";
import { ArrowLeft, MapPin, Layers, Share2, Download, CheckCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function decodeHtml(html: string): string {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerHTML;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const project = useAppSelector((state) =>
    state.projects.list.find((p) => p.id === id)
  );

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Proyecto no encontrado</p>
        <Link to="/projects" className="text-primary font-medium text-sm mt-2 inline-block">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const whatsappMsg = encodeURIComponent(
    `¡Hola! 👋 Te comparto información sobre *${project.title}* en ${project.location}. Lotes desde $${project.priceFrom.toLocaleString()}. ¿Te interesa saber más?`
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative h-56 md:h-72">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <Link
          to="/projects"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 md:p-8 space-y-6 -mt-8 relative"
      >
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
          <h1 className="text-xl font-extrabold text-foreground">{project.title}</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" /> {project.location}
          </div>
          <div
            className="text-sm text-muted-foreground leading-relaxed prose prose-sm prose-invert max-w-none [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: decodeHtml(project.description ?? "") }}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Desde</p>
              <p className="font-extrabold text-foreground text-sm">${project.priceFrom.toLocaleString()}</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Comisión</p>
              <p className="font-extrabold text-primary text-sm">
                {project.commissionType === "%" ? `${project.commission}%` : `$${project.commission.toLocaleString()}`}
              </p>
            </div>
            <div className="bg-accent/10 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Valor Total COP</p>
              <p className="font-extrabold text-foreground text-sm">
                {project.commissionType === "%"
                  ? (project.priceFrom * project.commission / 100).toLocaleString("es-CO")
                  : project.commission.toLocaleString("es-CO")}
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Lotes</p>
              <p className="font-extrabold text-foreground text-sm flex items-center justify-center gap-1">
                <Layers className="w-3 h-3" /> {project.lotsAvailable}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3">Amenidades</h2>
          <div className="grid grid-cols-2 gap-2">
            {project.amenities.map((am) => (
              <div key={am} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-accent" />
                {am}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://wa.me/?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 gradient-success text-primary-foreground font-bold py-3 rounded-xl text-sm"
          >
            <Share2 className="w-4 h-4" /> Compartir por WhatsApp
          </a>
          <Button variant="outline" className="rounded-xl py-3 h-auto">
            <Video className="w-4 h-4 mr-2" /> Descargar Video
          </Button>
          <Button variant="outline" className="rounded-xl py-3 h-auto col-span-2">
            <Download className="w-4 h-4 mr-2" /> Descargar PDF
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetail;
