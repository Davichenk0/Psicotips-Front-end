import React from 'react';
import { UserPlus } from 'lucide-react';
import { ClientTable } from '../ClientTable';
import { ClientDetailPanel } from '../ClientDetailPanel';
import { useClients } from '../../context/ClientContext';

// Página de Clientes: tabla con búsqueda + panel lateral que se abre al seleccionar una fila.
export const ClientsPage = () => {
  const { clients, loading, error } = useClients();

  return (
    <section className="clients-page">
      <div className="clients-header">
        <div>
          <h1 className="clients-title">Clientes</h1>
          <p className="clients-subtitle">
            {loading
              ? 'Cargando clientes...'
              : error
                ? 'No se pudieron cargar los clientes'
                : `${clients.length} clientes registrados`}
          </p>
        </div>

        <button type="button" className="new-client-button">
          <UserPlus size={15} />
          Nuevo cliente
        </button>
      </div>

      <div className="clients-content">
        <ClientTable />
      </div>

      {/* Panel de detalle: se muestra sobre esta página cuando hay un cliente seleccionado. */}
      <ClientDetailPanel />
    </section>
  );
};
