import React from 'react';
import { UserPlus } from 'lucide-react';
import { ClientTable } from '../ClientTable';
import { useClients } from '../../context/ClientContext';

// Página de Clientes: tabla con búsqueda. Al hacer clic en una fila se navega
// a la página de perfil completa del cliente (ver ClientProfilePage).
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
    </section>
  );
};
