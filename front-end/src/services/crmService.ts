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

// Extractor genérico: el backend a veces devuelve un arreglo plano y a veces una respuesta paginada { results: [...] }.
const extractList = <T,>(payload: T[] | PaginatedResponse<T>): T[] => {
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
  return extractList(payload).map(mapContactToClient);
};

// ===== Conversaciones y requerimientos del cliente seleccionado =====
// NOTA: estos endpoints siguen el mismo patrón que /api/crm/contacts/,
// pero aún no están confirmados con el backend. Si el back usa otra ruta
// (ej. /api/crm/conversations/?contact=<id>), solo hay que ajustar la URL aquí abajo.
// Mientras tanto, si el endpoint responde 404 o falla, devolvemos un arreglo vacío
// en lugar de romper el panel de detalle.

export interface Conversation {
  id: string;
  channel: string;
  date: string;
  preview: string;
  messageCount?: number;
  status: 'Abierta' | 'Cerrada' | 'Esperando respuesta';
  assignedTo?: string;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate?: string;
  createdDate?: string;
  priority: 'Alta' | 'Media' | 'Baja';
  type?: string;
  assignedTo?: string;
  botSolution?: string;
}

interface BackendConversation {
  id?: string | number;
  channel?: string;
  source?: string;
  date?: string;
  created_at?: string;
  createdAt?: string;
  last_message?: string;
  lastMessage?: string;
  message?: string;
  preview?: string;
  message_count?: number;
  messageCount?: number;
  status?: string;
  state?: string;
  assigned_to?: string;
  assignedTo?: string;
  agent?: string;
}

interface BackendRequirement {
  id?: string | number;
  title?: string;
  name?: string;
  description?: string;
  detail?: string;
  status?: string;
  state?: string;
  due_date?: string;
  dueDate?: string;
  created_at?: string;
  createdAt?: string;
  priority?: string;
  type?: string;
  category?: string;
  assigned_to?: string;
  assignedTo?: string;
  agent?: string;
  bot_solution?: string;
  botSolution?: string;
  suggested_solution?: string;
  ai_suggestion?: string;
}

const normalizeConversationStatus = (raw?: string): Conversation['status'] => {
  const normalized = raw?.toLowerCase();

  if (normalized?.includes('cerr') || normalized?.includes('closed')) {
    return 'Cerrada';
  }

  if (normalized?.includes('espera') || normalized?.includes('pending')) {
    return 'Esperando respuesta';
  }

  return 'Abierta';
};

const normalizePriority = (raw?: string): Requirement['priority'] => {
  const normalized = raw?.toLowerCase();

  if (normalized?.includes('alt') || normalized?.includes('high') || normalized?.includes('urg')) {
    return 'Alta';
  }

  if (normalized?.includes('baj') || normalized?.includes('low')) {
    return 'Baja';
  }

  return 'Media';
};

const mapConversation = (raw: BackendConversation, index: number): Conversation => ({
  id: String(raw.id ?? index),
  channel: raw.channel || raw.source || 'WhatsApp',
  date: formatDate(raw.date || raw.created_at || raw.createdAt),
  preview: raw.preview || raw.last_message || raw.lastMessage || raw.message || 'Sin mensajes recientes',
  messageCount: raw.message_count ?? raw.messageCount,
  status: normalizeConversationStatus(raw.status || raw.state),
  assignedTo: raw.assigned_to || raw.assignedTo || raw.agent,
});

const mapRequirement = (raw: BackendRequirement, index: number): Requirement => ({
  id: String(raw.id ?? index),
  title: raw.title || raw.name || `Requerimiento ${index + 1}`,
  description: raw.description || raw.detail || 'Sin descripción',
  status: raw.status || raw.state || 'Pendiente',
  dueDate: raw.due_date || raw.dueDate ? formatDate(raw.due_date || raw.dueDate) : undefined,
  createdDate: raw.created_at || raw.createdAt ? formatDate(raw.created_at || raw.createdAt) : undefined,
  priority: normalizePriority(raw.priority),
  type: raw.type || raw.category,
  assignedTo: raw.assigned_to || raw.assignedTo || raw.agent,
  botSolution: raw.bot_solution || raw.botSolution || raw.suggested_solution || raw.ai_suggestion,
});

export const getClientConversations = async (clientId: string, token: string): Promise<Conversation[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/crm/contacts/${clientId}/conversations/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json() as BackendConversation[] | PaginatedResponse<BackendConversation>;
    return extractList(payload).map(mapConversation);
  } catch {
    return [];
  }
};

export const getClientRequirements = async (clientId: string, token: string): Promise<Requirement[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/crm/contacts/${clientId}/requirements/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json() as BackendRequirement[] | PaginatedResponse<BackendRequirement>;
    return extractList(payload).map(mapRequirement);
  } catch {
    return [];
  }
};