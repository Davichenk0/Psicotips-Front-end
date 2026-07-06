import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getContacts } from '../services/crmService';

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
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void; // Función para actualizar el término de búsqueda en el contexto.
  statusFilter: string;
  setStatusFilter: (status: string) => void; // Función para actualizar el filtro de estado en el contexto.
}

// Crear un contexto de clientes con un valor inicial indefinido.
const ClientContext = createContext<ClientContextType | undefined>(undefined);

// Proveedor de contexto que envuelve la aplicación y maneja el estado de clientes, búsqueda y filtros.
export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // El estado de búsqueda se centraliza aquí para evitar pasar props por toda la tabla.
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  useEffect(() => {
    if (!token) {
      setClients([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadClients = async () => {
      setLoading(true);
      setError(null);

      try {
        const contacts = await getContacts(token);
        if (!cancelled) {
          setClients(contacts);
        }
      } catch (loadError: any) {
        if (!cancelled) {
          setClients([]);
          setError(loadError.message || 'No se pudieron cargar los contactos');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadClients();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Proporcionar el estado y las funciones de clientes a los componentes hijos a través del contexto.
  return (
    <ClientContext.Provider value={{ clients, loading, error, searchTerm, setSearchTerm, statusFilter, setStatusFilter }}>
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