import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definición de la estructura de un cliente, incluyendo su ID, nombre, empresa, estado, canal y fecha de registro.
export interface Client {
  id: string;
  name: string;
  company: string;
  status: 'Activo' | 'Prospecto' | 'Inactivo';
  channel: string;
  registrationDate: string;
}

// Definición de la estructura del contexto de clientes, incluyendo la lista de clientes, términos de búsqueda y filtros de estado.
interface ClientContextType {
  clients: Client[];
  searchTerm: string;
  setSearchTerm: (term: string) => void; // Función para actualizar el término de búsqueda en el contexto.
  statusFilter: string;
  setStatusFilter: (status: string) => void; // Función para actualizar el filtro de estado en el contexto.
}

// Crear un contexto de clientes con un valor inicial indefinido.
const ClientContext = createContext<ClientContextType | undefined>(undefined);

// Los datos iniciales replican la captura de referencia para que la interfaz cargue con filas realistas.
const initialClients: Client[] = [
  { id: '1', name: 'Ana García', company: 'TechVentures S.A.', status: 'Activo', channel: 'Web', registrationDate: '14/09/2024' },
  { id: '2', name: 'Carlos Mendoza', company: 'Constructora del Norte', status: 'Activo', channel: 'Referido', registrationDate: '02/10/2024' },
  { id: '3', name: 'Laura Rincón', company: 'FinanceIQ Colombia', status: 'Prospecto', channel: 'Email', registrationDate: '19/11/2024' },
  { id: '4', name: 'Diego Castillo', company: 'LogiExpress', status: 'Activo', channel: 'WhatsApp', registrationDate: '06/08/2024' },
  { id: '5', name: 'Sofía Herrera', company: 'EduPlus', status: 'Inactivo', channel: 'Llamada', registrationDate: '13/07/2024' },
  { id: '6', name: 'Andrés Vargas', company: 'SaludVida IPS', status: 'Activo', channel: 'Web', registrationDate: '07/01/2025' },
  { id: '7', name: 'Mariana López', company: 'Retail Express', status: 'Prospecto', channel: 'Web', registrationDate: '11/02/2025' },
];

// Proveedor de contexto que envuelve la aplicación y maneja el estado de clientes, búsqueda y filtros.
export const ClientProvider = ({ children }: { children: ReactNode }) => {
  // El estado de búsqueda se centraliza aquí para evitar pasar props por toda la tabla.
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Proporcionar el estado y las funciones de clientes a los componentes hijos a través del contexto.
  return (
    <ClientContext.Provider value={{ clients: initialClients, searchTerm, setSearchTerm, statusFilter, setStatusFilter }}>
      {children}
    </ClientContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de clientes de manera segura.  
export const useClients = () => {
  const context = useContext(ClientContext);
  // Fallar de inmediato si se olvidó el proveedor en el árbol.
  if (!context) throw new Error('useClients debe usarse dentro de ClientProvider');
  return context;
};