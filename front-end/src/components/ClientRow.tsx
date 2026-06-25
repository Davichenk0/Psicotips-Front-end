import React from 'react';
import { Client } from '../context/ClientContext';
import { ChevronRight } from 'lucide-react';

const statusStyles = {
  Activo: 'status-badge status-badge--active',
  Prospecto: 'status-badge status-badge--prospect',
  Inactivo: 'status-badge status-badge--inactive',
};

export const ClientRow = ({ client }: { client: Client }) => {
  // Generar una etiqueta corta para el avatar a partir de las iniciales del cliente.
  const initials = client.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2);

  // Cada fila es un registro de solo lectura con un hover sutil.
  return (
    <tr className="client-row">
      <td>
        <div className="client-cell">
          <div className="client-avatar">{initials}</div>
          <div>
            <div className="client-name">{client.name}</div>
            <div className="client-company">
              <span className="client-company-icon">▣</span>
              {client.company}
            </div>
          </div>
        </div>
      </td>
      <td>
        <span className={statusStyles[client.status]}>{client.status}</span>
      </td>
      <td className="table-text">{client.channel}</td>
      <td className="table-text">{client.registrationDate}</td>
      <td>
        <ChevronRight size={16} className="row-arrow" />
      </td>
    </tr>
  );
};