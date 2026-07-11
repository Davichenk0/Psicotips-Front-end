import React from 'react';
import { Search } from 'lucide-react';
import { useClients } from '../context/ClientContext';

// Lista angosta de clientes reutilizada en las páginas de Conversaciones y Requerimientos.
// Selecciona un cliente en el contexto global; el panel de la derecha reacciona a ese cambio.
export const ClientPickerList = () => {
  const { clients, loading, searchTerm, setSearchTerm, selectedClient, setSelectedClient } = useClients();

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="picker-list">
      <div className="picker-search">
        <Search size={14} className="picker-search-icon" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="picker-items">
        {loading && <p className="picker-empty">Cargando clientes...</p>}

        {!loading && filteredClients.length === 0 && (
          <p className="picker-empty">No hay clientes para mostrar.</p>
        )}

        {!loading &&
          filteredClients.map((client) => {
            const initials = client.name
              .split(' ')
              .map((word) => word[0])
              .join('')
              .substring(0, 2);

            const isActive = selectedClient?.id === client.id;

            return (
              <button
                key={client.id}
                type="button"
                className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                onClick={() => setSelectedClient(client)}
              >
                <span className="picker-item-avatar">{initials}</span>
                <span className="picker-item-text">
                  <span className="picker-item-name">{client.name}</span>
                  <span className="picker-item-company">{client.company || 'Sin empresa'}</span>
                </span>
              </button>
            );
          })}
      </div>
    </aside>
  );
};
