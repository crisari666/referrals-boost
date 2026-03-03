import { useParams, Link } from "react-router-dom";
import { clients, projects, statusLabels, statusColors } from "@/data/mockData";
import { ArrowLeft, Phone, MessageCircle, Send, StickyNote } from "lucide-react";
import { motion } from "framer-motion";

const ClientDetail = () => {
  const { id } = useParams();
  const client = clients.find((c) => c.id === id);

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Link to="/clients" className="text-primary font-medium text-sm mt-2 inline-block">
          Volver a clientes
        </Link>
      </div>
    );
  }

  const project = projects.find((p) => p.id === client.projectInterest);
  const initials = client.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/clients"
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </Link>
        <h1 className="font-bold text-foreground">Detalle del Cliente</h1>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 border border-border shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-commission flex items-center justify-center text-primary-foreground font-bold text-lg">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-foreground text-lg">{client.name}</h2>
            <p className="text-sm text-muted-foreground">{project?.title}</p>
            <span className={`inline-block mt-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColors[client.status]}`}>
              {statusLabels[client.status]}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          <a
            href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 bg-accent/10 rounded-xl py-3"
          >
            <MessageCircle className="w-5 h-5 text-accent" />
            <span className="text-[10px] font-medium text-accent">WhatsApp</span>
          </a>
          <a
            href={`tel:${client.phone.replace(/\D/g, "")}`}
            className="flex flex-col items-center gap-1 bg-info/10 rounded-xl py-3"
          >
            <Phone className="w-5 h-5 text-info" />
            <span className="text-[10px] font-medium text-info">Llamar</span>
          </a>
          <button className="flex flex-col items-center gap-1 bg-primary/10 rounded-xl py-3">
            <Send className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium text-primary">Enviar Info</span>
          </button>
        </div>
      </motion.div>

      {/* Interaction timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-5 border border-border shadow-sm"
      >
        <h3 className="font-bold text-foreground mb-4">Historial de Interacciones</h3>
        <div className="space-y-4">
          {client.interactions.map((inter, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full gradient-commission mt-1" />
                {i < client.interactions.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-1" />
                )}
              </div>
              <div className="pb-4">
                <p className="text-xs text-muted-foreground">{inter.date} · {inter.type}</p>
                <p className="text-sm text-foreground mt-0.5">{inter.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Notes */}
      {client.notes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-5 border border-border shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <StickyNote className="w-4 h-4 text-warning" />
            <h3 className="font-bold text-foreground">Notas Privadas</h3>
          </div>
          <ul className="space-y-2">
            {client.notes.map((note, i) => (
              <li key={i} className="text-sm text-muted-foreground bg-secondary/50 rounded-xl px-4 py-2.5">
                {note}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default ClientDetail;
