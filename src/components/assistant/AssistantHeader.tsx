import { Sparkles } from "lucide-react";

const AssistantHeader = () => (
  <div className="flex-shrink-0 px-4 pt-6 pb-3 md:px-8 border-b border-border bg-card">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl gradient-commission flex items-center justify-center shadow-md">
        <Sparkles className="w-5 h-5 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-foreground">Asistente AI</h1>
        <p className="text-xs text-muted-foreground">Información de proyectos, financiamiento y ventas</p>
      </div>
      <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-success">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        En línea
      </span>
    </div>
  </div>
);

export default AssistantHeader;
