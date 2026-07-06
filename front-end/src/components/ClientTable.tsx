import React from 'react';
import { useClients } from '../context/ClientContext';
import { ClientRow } from './ClientRow';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';

// El componente ClientTable es responsable de mostrar la lista de clientes en una tabla con funcionalidad de búsqueda y filtrado.
export const ClientTable = () => {
  const { clients, loading, error, searchTerm, setSearchTerm } = useClients();

  // El filtrado de clientes se mantiene local para que la escritura responda al instante.
  // Filtra los clientes por nombre o empresa según el término de búsqueda ingresado.
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* La barra de búsqueda y el botón de filtro replican la barra de herramientas de la referencia. */}
      <div className="table-toolbar">
        <div className="table-search">
          <Search className="table-search-icon" size={17} />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="table-filter" type="button">
          <SlidersHorizontal size={16} />
          <span>Todos los...</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* La tabla vive dentro de una tarjeta oscura con anchos fijos para alinear las columnas. */}
      <div className="table-card">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Canal</th>
              <th>Registro</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="table-text">Cargando clientes...</td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={5} className="table-text">{error}</td>
              </tr>
            )}
            {!loading && !error && filteredClients.length === 0 && (
              <tr>
                <td colSpan={5} className="table-text">No hay clientes para mostrar.</td>
              </tr>
            )}
            {!loading && !error && filteredClients.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};