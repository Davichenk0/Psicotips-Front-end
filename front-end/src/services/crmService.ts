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
  industry?: string;
  category?: string;
  company?: string;
  notes?: string;
  description?: string;
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
    company: contact.company || contact.industry || '',
    email: contact.email,
    phone: contact.phone,
    category: contact.industry || contact.category,
    notes: contact.notes || contact.description,
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
  status: 'Activa' | 'En proceso' | 'Finalizada';
  assignedTo?: string;
}

export interface RequirementPriorityItem {
  label: string;
  level: 'Alta' | 'Media' | 'Baja';
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
  // Campos opcionales que arman la vista de detalle completa, tipo documento de análisis.
  identifiedNeeds?: string[];
  objectives?: string[];
  scope?: string;
  priorities?: RequirementPriorityItem[];
  restrictions?: string[];
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
  // Campos del documento de análisis completo (nombres flexibles por si el backend usa otros).
  identified_needs?: string[] | string;
  identifiedNeeds?: string[] | string;
  needs?: string[] | string;
  objectives?: string[] | string;
  project_objectives?: string[] | string;
  scope?: string;
  alcance?: string;
  priorities?: Array<{ label?: string; name?: string; level?: string; priority?: string }> | string;
  restrictions?: string[] | string;
  restricciones?: string[] | string;
}

// Normaliza un campo que puede llegar como arreglo o como texto (separado por saltos de línea o comas).
const toStringArray = (raw?: string[] | string): string[] => {
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw.filter(Boolean);
  }

  return raw
    .split(/\r?\n|,(?![^(]*\))/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const toPriorityItems = (
  raw?: Array<{ label?: string; name?: string; level?: string; priority?: string }> | string
): RequirementPriorityItem[] => {
  if (!raw) {
    return [];
  }

  if (typeof raw === 'string') {
    return toStringArray(raw).map((label) => ({ label, level: 'Media' as const }));
  }

  return raw.map((item) => ({
    label: item.label || item.name || 'Prioridad',
    level: normalizePriority(item.level || item.priority),
  }));
};

const normalizeConversationStatus = (raw?: string): Conversation['status'] => {
  const normalized = raw?.toLowerCase();

  if (
    normalized?.includes('cerr') ||
    normalized?.includes('closed') ||
    normalized?.includes('final') ||
    normalized?.includes('conclu')
  ) {
    return 'Finalizada';
  }

  if (
    normalized?.includes('espera') ||
    normalized?.includes('pending') ||
    normalized?.includes('proceso') ||
    normalized?.includes('progress')
  ) {
    return 'En proceso';
  }

  return 'Activa';
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
  identifiedNeeds: toStringArray(raw.identified_needs || raw.identifiedNeeds || raw.needs),
  objectives: toStringArray(raw.objectives || raw.project_objectives),
  scope: raw.scope || raw.alcance,
  priorities: toPriorityItems(raw.priorities),
  restrictions: toStringArray(raw.restrictions || raw.restricciones),
});

// ===== DATOS QUEMADOS DE PRUEBA =====
// Mientras el backend no tenga listos los endpoints de conversaciones, requerimientos y
// propuestas, usamos estos datos de ejemplo para poder ver el diseño funcionando.
// Cuando el backend real esté listo, borra este bloque completo (y los 3 "if" que lo usan
// más abajo) y todo va a seguir funcionando igual, pero con datos reales.
export const USE_MOCK_DATA_FALLBACK = true;

const getMockConversations = (): Conversation[] => [
  {
    id: 'mock-1',
    channel: 'WhatsApp',
    date: '10 de enero, 2025',
    preview: 'Quedamos en agendar la demo para la próxima semana.',
    messageCount: 8,
    status: 'Finalizada',
    assignedTo: 'Laura Pérez',
  },
  {
    id: 'mock-2',
    channel: 'Correo',
    date: '2 de febrero, 2025',
    preview: 'El cliente pidió una cotización actualizada con el nuevo alcance.',
    messageCount: 4,
    status: 'En proceso',
    assignedTo: 'Laura Pérez',
  },
  {
    id: 'mock-3',
    channel: 'Web',
    date: '18 de febrero, 2025',
    preview: 'Consulta inicial sobre integración con Salesforce.',
    messageCount: 3,
    status: 'Activa',
  },
];

const getMockRequirements = (): Requirement[] => [
  {
    id: 'mock-req-1',
    title: 'Plataforma de automatización comercial con integración Salesforce',
    description:
      'El cliente necesita automatizar tareas manuales del equipo de ventas e integrar sus canales de comunicación.',
    status: 'Aprobado',
    createdDate: '10 de enero, 2025',
    dueDate: '10 de abril, 2025',
    priority: 'Alta',
    type: 'Automatización comercial',
    assignedTo: 'Laura Pérez',
    botSolution:
      'Se sugiere implementar un middleware que sincronice los leads capturados por WhatsApp Business API directamente con Salesforce Sales Cloud, evitando el registro manual.',
    identifiedNeeds: [
      'Eliminar tareas manuales del equipo de ventas (12 personas)',
      'Integrar canales de comunicación (WhatsApp, email, CRM)',
      'Automatizar seguimiento de oportunidades comerciales',
      'Centralizar información de clientes y prospectos',
    ],
    objectives: [
      'Reducir tiempo administrativo del equipo en un 40%',
      'Aumentar la tasa de seguimiento oportuno al 100%',
      'Mejorar la visibilidad del pipeline de ventas',
      'Integración bidireccional con Salesforce existente',
    ],
    scope:
      'Desarrollo de una plataforma de automatización comercial que incluye: (1) módulo de seguimiento automático de leads con notificaciones vía WhatsApp y correo, (2) integración bidireccional con Salesforce, (3) generador de propuestas desde plantillas configurables, (4) dashboard de métricas en tiempo real. El proyecto no incluye migración de datos históricos ni capacitación extendida.',
    priorities: [
      { label: 'Integración con Salesforce', level: 'Alta' },
      { label: 'Seguridad y control de acceso', level: 'Alta' },
      { label: 'Notificaciones automáticas en tiempo real', level: 'Alta' },
      { label: 'Generador de propuestas', level: 'Media' },
      { label: 'Dashboard de métricas', level: 'Media' },
      { label: 'Reportes exportables', level: 'Baja' },
    ],
    restrictions: [
      'Presupuesto máximo definido por el cliente: $22.000.000 COP',
      'Integración limitada con Salesforce Sales Cloud',
      'Plazo de implementación: 12 semanas',
      'Cumplimiento con políticas internas de protección de datos del cliente',
    ],
  },
  {
    id: 'mock-req-2',
    title: 'Módulo de reportería automatizada para el equipo directivo',
    description:
      'El cliente solicitó reportes semanales automáticos con los indicadores clave del embudo de ventas.',
    status: 'Pendiente',
    createdDate: '5 de marzo, 2025',
    dueDate: '20 de mayo, 2025',
    priority: 'Media',
    type: 'Reportería',
    assignedTo: 'Laura Pérez',
    identifiedNeeds: [
      'Visibilidad semanal del embudo de ventas para gerencia',
      'Eliminar el armado manual de reportes en Excel',
    ],
    objectives: [
      'Reducir el tiempo de generación de reportes de 4 horas a minutos',
      'Enviar automáticamente el reporte cada lunes por correo',
    ],
    scope:
      'Módulo de reportería que consulta datos de Salesforce y genera un PDF con los indicadores clave, enviado automáticamente por correo cada lunes a las 8:00 a.m.',
    priorities: [
      { label: 'Automatización del envío semanal', level: 'Alta' },
      { label: 'Diseño del reporte en PDF', level: 'Media' },
    ],
    restrictions: ['Depende de que el módulo de Salesforce ya esté integrado'],
  },
];

const getMockProposals = (clientName: string, companyName: string): Proposal[] => [
  {
    id: 'mock-prop-1',
    title: 'Propuesta Comercial: Plataforma de Automatización Comercial',
    status: 'Aceptada',
    createdDate: '15 de enero, 2025',
    executiveSummary:
      'TechVentures S.A. requiere una solución que elimine ineficiencias manuales de su equipo comercial de 12 personas. Proponemos una plataforma cloud integrada con Salesforce que automatiza el seguimiento de leads, genera propuestas desde plantillas y ofrece visibilidad real del pipeline, todo dentro de un presupuesto de $22M COP y un plazo de 12 semanas.',
    scopeIncluded: [
      'Integración bidireccional con Salesforce Sales Cloud',
      'Módulo de seguimiento automático con notificaciones por WhatsApp Business API y correo',
      'Generador de propuestas con plantillas configurables',
      'Dashboard de métricas y reportería',
      'Despliegue en AWS con SLA del 99.5%',
      'Capacitación para hasta 15 usuarios',
    ],
    exclusions: [
      'Migración de datos históricos de Salesforce',
      'Desarrollo de reportes a la medida',
      'Licencias de terceros (Salesforce, WhatsApp Business API)',
      'Soporte post-lanzamiento (se cotiza aparte)',
    ],
    phases: [
      { phase: 'Fase 1 (semanas 1-4)', description: 'Análisis, diseño y setup de infraestructura.' },
      { phase: 'Fase 2 (semanas 5-10)', description: 'Desarrollo iterativo con entregables parciales.' },
      { phase: 'Fase 3 (semanas 11-12)', description: 'Pruebas de aceptación, despliegue y capacitación.' },
    ],
    costBreakdown: [
      { id: 'c1', label: 'Análisis y arquitectura de solución', description: 'Levantamiento de requerimientos, diseño de arquitectura cloud y plan de proyecto.', amount: 3500000 },
      { id: 'c2', label: 'Desarrollo módulo de seguimiento de leads', description: 'Automatización de seguimiento con notificaciones WhatsApp y correo, integración con Salesforce.', amount: 8000000 },
      { id: 'c3', label: 'Desarrollo generador de propuestas', description: 'Motor de generación de propuestas desde plantillas con variables dinámicas.', amount: 4500000 },
      { id: 'c4', label: 'Dashboard de métricas y reportería', description: 'Panel con KPIs de ventas, embudo y reportes exportables.', amount: 3000000 },
      { id: 'c5', label: 'Pruebas, despliegue y capacitación', description: 'QA, despliegue en AWS y capacitación al equipo de 15 usuarios.', amount: 2000000 },
    ],
    totalEstimated: 21000000,
    clientName: clientName || 'Ana García',
    companyName: companyName || 'TechVentures S.A.',
  },
];


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
      return USE_MOCK_DATA_FALLBACK ? getMockConversations() : [];
    }

    const payload = await response.json() as BackendConversation[] | PaginatedResponse<BackendConversation>;
    const conversations = extractList(payload).map(mapConversation);
    return conversations.length > 0 || !USE_MOCK_DATA_FALLBACK ? conversations : getMockConversations();
  } catch {
    return USE_MOCK_DATA_FALLBACK ? getMockConversations() : [];
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
      return USE_MOCK_DATA_FALLBACK ? getMockRequirements() : [];
    }

    const payload = await response.json() as BackendRequirement[] | PaginatedResponse<BackendRequirement>;
    const requirements = extractList(payload).map(mapRequirement);
    return requirements.length > 0 || !USE_MOCK_DATA_FALLBACK ? requirements : getMockRequirements();
  } catch {
    return USE_MOCK_DATA_FALLBACK ? getMockRequirements() : [];
  }
};

// ===== Propuestas comerciales del cliente =====
// Mismo patrón de los otros dos módulos: si el endpoint no existe todavía, devolvemos un
// arreglo vacío en lugar de romper la vista.

export interface ProposalCostItem {
  id: string;
  label: string;
  description?: string;
  amount: number;
}

export interface ProposalPhase {
  phase: string;
  description: string;
}

export interface Proposal {
  id: string;
  title: string;
  status: string;
  createdDate: string;
  executiveSummary: string;
  scopeIncluded: string[];
  exclusions: string[];
  phases: ProposalPhase[];
  costBreakdown: ProposalCostItem[];
  totalEstimated: number;
  clientName: string;
  companyName: string;
}

interface BackendProposal {
  id?: string | number;
  title?: string;
  name?: string;
  status?: string;
  state?: string;
  created_at?: string;
  createdAt?: string;
  executive_summary?: string;
  executiveSummary?: string;
  summary?: string;
  scope_included?: string[] | string;
  scopeIncluded?: string[] | string;
  exclusions?: string[] | string;
  phases?: Array<{ phase?: string; name?: string; description?: string }>;
  methodology?: Array<{ phase?: string; name?: string; description?: string }>;
  cost_breakdown?: Array<{ id?: string | number; label?: string; name?: string; description?: string; amount?: number }>;
  costBreakdown?: Array<{ id?: string | number; label?: string; name?: string; description?: string; amount?: number }>;
  total_estimated?: number;
  totalEstimated?: number;
  client_name?: string;
  clientName?: string;
  company_name?: string;
  companyName?: string;
}

const mapProposal = (raw: BackendProposal, index: number, fallbackClientName: string, fallbackCompany: string): Proposal => ({
  id: String(raw.id ?? index),
  title: raw.title || raw.name || `Propuesta ${index + 1}`,
  status: raw.status || raw.state || 'Pendiente',
  createdDate: formatDate(raw.created_at || raw.createdAt),
  executiveSummary: raw.executive_summary || raw.executiveSummary || raw.summary || 'Sin resumen ejecutivo.',
  scopeIncluded: toStringArray(raw.scope_included || raw.scopeIncluded),
  exclusions: toStringArray(raw.exclusions),
  phases: (raw.phases || raw.methodology || []).map((phase, phaseIndex) => ({
    phase: phase.phase || phase.name || `Fase ${phaseIndex + 1}`,
    description: phase.description || '',
  })),
  costBreakdown: (raw.cost_breakdown || raw.costBreakdown || []).map((item, itemIndex) => ({
    id: String(item.id ?? itemIndex),
    label: item.label || item.name || `Ítem ${itemIndex + 1}`,
    description: item.description,
    amount: item.amount ?? 0,
  })),
  totalEstimated: raw.total_estimated ?? raw.totalEstimated ?? 0,
  clientName: raw.client_name || raw.clientName || fallbackClientName,
  companyName: raw.company_name || raw.companyName || fallbackCompany,
});

export const getClientProposals = async (
  clientId: string,
  token: string,
  clientName: string = '',
  companyName: string = ''
): Promise<Proposal[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/crm/contacts/${clientId}/proposals/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return USE_MOCK_DATA_FALLBACK ? getMockProposals(clientName, companyName) : [];
    }

    const payload = await response.json() as BackendProposal[] | PaginatedResponse<BackendProposal>;
    const proposals = extractList(payload).map((raw, index) => mapProposal(raw, index, clientName, companyName));
    return proposals.length > 0 || !USE_MOCK_DATA_FALLBACK ? proposals : getMockProposals(clientName, companyName);
  } catch {
    return USE_MOCK_DATA_FALLBACK ? getMockProposals(clientName, companyName) : [];
  }
};