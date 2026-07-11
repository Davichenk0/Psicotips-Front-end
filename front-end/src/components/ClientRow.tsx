import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, useClients } from '../context/ClientContext';
import { ChevronRight } from 'lucide-react';

const statusStyles = {
  Activo: 'status-badge status-badge--active',
  Prospecto: 'status-badge status-badge--prospect',
  Inactivo: 'status-badge status-badge--inactive',
};

export const ClientRow = ({ client }: { client: Client }) => {
  // Al hacer clic en la fila se navega a la página de perfil completa del cliente
  // (info + conversaciones + requerimientos + propuestas).
  const { setSelectedClient } = useClients();
  const navigate = useNavigate();

  const openProfile = () => {
    setSelectedClient(client);
    navigate(`/clientes/${client.id}`);
  };

  // Generar una etiqueta corta para el avatar a partir de las iniciales del cliente.
  const initials = client.name
    .split(' ')                 // Divide el nombre completo en palabras por cada espacio.
    .map((word) => word[0])     // Toma la primera letra de cada palabra.
    .join('')                   // Une esas letras en una sola cadena de texto.
    .substring(0, 2);           // Se asegura de recortar el resultado a un máximo de 2 letras.

  // Cada fila es clicable: navega al perfil del cliente con hover sutil.
  return (
    <tr
      className="client-row client-row--clickable"
      onClick={openProfile}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          openProfile();
        }
      }}
    >
      <td>
        <div className="client-cell">
          <div className="client-avatar">{initials}</div>
          <div>
            <div className="client-name">{client.name}</div>
            <div className="client-company">
              <span className="client-company-icon">▣</span>
              {client.company || 'Sin empresa'}
            </div>
          </div>
        </div>
      </td>
      <td>
        <span className={statusStyles[client.status]}>{client.status}</span> 
        {/* El resultado en el navegador será un texto que dice "Activo" envuelto en un óvalo */}
      </td>
      <td className="table-text">{client.channel}</td>
      <td className="table-text">{client.registrationDate}</td>
        {/*Muestran de dónde vino el cliente (ej. Especializado, Orgánico, Web) y cuándo se registró*/}
      <td>
        <ChevronRight size={16} className="row-arrow" />
        {/* Icono de flecha que indica que se puede hacer clic en la fila para ver más detalles */}
      </td>
    </tr>
  );
};