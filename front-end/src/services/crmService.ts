import { Client } from '../context/ClientContext';

const API_BASE_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const CONTACTS_URL = `${API_BASE_URL}/api/crm/contacts/`;

interface BackendContact {
  id?: string | number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  status?: string;
  state?: string;
  channel?: string;
  source?: string;
  origin?: string;
  created_at?: string;
  createdAt?: string;
  registration_date?: string;
  registrationDate?: string;
  updated_at?: string;
}

interface PaginatedResponse<T> {
  results?: T[];
}

const normalizeStatus = (rawStatus?: string): Client['status'] => {
  const normalized = rawStatus?.toLowerCase();

  if (normalized?.includes('inactivo') || normalized?.includes('inactive')) {
    return 'Inactivo';
  }

  if (normalized?.includes('prospect')) {
    return 'Prospecto';
  }

  return 'Activo';
};

const formatDate = (rawDate?: string) => {
  if (!rawDate) {
    return '-';
  }

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return rawDate;
  }

  return new Intl.DateTimeFormat('es-CO').format(parsedDate);
};

const mapContactToClient = (contact: BackendContact, index: number): Client => {
  const fullName =
    contact.name ||
    [contact.first_name, contact.last_name].filter(Boolean).join(' ').trim() ||
    `Cliente ${index + 1}`;

  return {
    id: String(contact.id ?? index),
    name: fullName,
    company: contact.email || contact.phone || 'Sin empresa',
    status: normalizeStatus(contact.status || contact.state),
    channel: contact.channel || contact.source || contact.origin || 'WhatsApp',
    registrationDate: formatDate(
      contact.registration_date ||
      contact.registrationDate ||
      contact.created_at ||
      contact.createdAt ||
      contact.updated_at
    ),
  };
};

const extractContacts = (payload: BackendContact[] | PaginatedResponse<BackendContact>) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.results || [];
};

export const getContacts = async (token: string): Promise<Client[]> => {
  const response = await fetch(CONTACTS_URL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'No se pudieron cargar los contactos');
  }

  const payload = await response.json() as BackendContact[] | PaginatedResponse<BackendContact>;
  return extractContacts(payload).map(mapContactToClient);
};