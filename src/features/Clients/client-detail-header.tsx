import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function ClientDetailHeader() {
  return (
    <div className="flex items-center gap-3">
      <Link
        to="/clients"
        className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center"
      >
        <ArrowLeft className="w-4 h-4 text-foreground" />
      </Link>
      <h1 className="font-bold text-foreground">Detalle del Cliente</h1>
    </div>
  );
}
