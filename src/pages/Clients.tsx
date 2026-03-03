import { clients } from "@/data/mockData";
import ClientRow from "@/components/ClientRow";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const Clients = () => {
  const [search, setSearch] = useState("");
  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Mis Clientes</h1>
          <p className="text-sm text-muted-foreground">{clients.length} clientes en total</p>
        </div>
        <button className="w-10 h-10 gradient-commission rounded-xl flex items-center justify-center shadow-md">
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((client, i) => (
          <ClientRow key={client.id} client={client} index={i} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No se encontraron clientes</p>
        )}
      </div>
    </div>
  );
};

export default Clients;
