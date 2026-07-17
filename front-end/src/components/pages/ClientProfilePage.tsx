import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Tag,
  Radio,
  CalendarDays,
  MessageSquare,
  FileText,
  Briefcase,
  Building2,
} from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useAuth } from '../../context/AuthContext';
import {
  Conversation,
  Requirement,
  Proposal,
  getClientConversations,
  getClientRequirements,
  getClientProposals,
  USE_MOCK_DATA_FALLBACK,
} from '../../services/crmService';

const statusStyles = {
  Activo: 'status-badge status-badge--active',
  Prospecto: 'status-badge status-badge--prospect',
  Inactivo: 'status-badge status-badge--inactive',
};

const conversationStatusStyles: Record<Conversation['status'], string> = {
  Activa: 'conversation-status conversation-status--open',
  'En proceso': 'conversation-status conversation-status--waiting',
  Finalizada: 'conversation-status conversation-status--closed',
};

const proposalStatusStyles: Record<string, string> = {
  Aceptada: 'proposal-status proposal-status--accepted',
  Aprobada: 'proposal-status proposal-status--accepted',
  Rechazada: 'proposal-status proposal-status--rejected',
  Pendiente: 'proposal-status proposal-status--pending',
};

// Nota de ejemplo mientras el backend no mande un campo "notes" real para el contacto.
// Bórrala cuando ese campo ya venga poblado desde el backend.
const DEMO_CLIENT_NOTE = 'Cliente interesada en automatización de procesos de ventas.';

// Página de perfil del cliente: reemplaza el antiguo panel lateral. Muestra toda la
// información de contacto junto con tres tarjetas resumen (Conversaciones, Requerimientos,
// Propuestas), cada una enlazando a su vista detallada correspondiente.
export const ClientProfilePage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { clients, selectedClient, setSelectedClient } = useClients();
  const { token } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  // El cliente puede venir ya seleccionado en el contexto (si se navegó desde la tabla),
  // o hay que buscarlo por id en la lista (si se entra directo por URL).
  const client = selectedClient?.id === clientId ? selectedClient : clients.find((c) => c.id === clientId);

  useEffect(() => {
    if (client && selectedClient?.id !== client.id) {
      setSelectedClient(client);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  useEffect(() => {
    if (!client || !token) {
      return;
    }

    let cancelled = false;

    const loadAll = async () => {
      setLoading(true);
      const [conversationsResult, requirementsResult, proposalsResult] = await Promise.all([
        getClientConversations(client.id, token),
        getClientRequirements(client.id, token),
        getClientProposals(client.id, token, client.name, client.company),
      ]);

      if (!cancelled) {
        setConversations(conversationsResult);
        setRequirements(requirementsResult);
        setProposals(proposalsResult);
        setLoading(false);
      }
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [client, token]);

  if (!client) {
    return (
      <section className="profile-page">
        <button type="button" className="profile-back" onClick={() => navigate('/')}>
          <ArrowLeft size={14} />
          Volver a clientes
        </button>
        <p className="detail-empty">No se encontró este cliente.</p>
      </section>
    );
  }

  const initials = client.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2);

  return (
    <section className="profile-page">
      <button type="button" className="profile-back" onClick={() => navigate('/')}>
        <ArrowLeft size={14} />
        Clientes
      </button>

      <div className="profile-header">
        <div className="detail-avatar detail-avatar--lg">{initials}</div>
        <div>
          <h1 className="profile-name">{client.name}</h1>
          <span className={statusStyles[client.status]}>{client.status}</span>
        </div>
      </div>

      <div className="profile-grid">
        {/* Columna izquierda: información de contacto */}
        <aside className="profile-contact-card">
          <h3 className="detail-section-title">Información de contacto</h3>

          <ul className="profile-contact-list">
            <li>
              <Building2 size={14} />
              <span className={!client.company ? 'profile-contact-empty' : ''}>
                {client.company || 'No se tiene el nombre de la empresa'}
              </span>
            </li>
            {client.email && (
              <li>
                <Mail size={14} />
                <span>{client.email}</span>
              </li>
            )}
            {client.phone && (
              <li>
                <Phone size={14} />
                <span>{client.phone}</span>
              </li>
            )}
            {client.category && (
              <li>
                <Tag size={14} />
                <span>{client.category}</span>
              </li>
            )}
            <li>
              <Radio size={14} />
              <span>{client.channel}</span>
            </li>
            <li>
              <CalendarDays size={14} />
              <span>Registro: {client.registrationDate}</span>
            </li>
          </ul>

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-number">{conversations.length}</span>
              <span className="profile-stat-label">Conversaciones</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-number">{requirements.length}</span>
              <span className="profile-stat-label">Requerimientos</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-number">{proposals.length}</span>
              <span className="profile-stat-label">Propuestas</span>
            </div>
          </div>

          {(client.notes || USE_MOCK_DATA_FALLBACK) && (
            <p className="profile-notes">{client.notes || DEMO_CLIENT_NOTE}</p>
          )}
        </aside>

        {/* Columna derecha: tres tarjetas resumen */}
        <div className="profile-summary-column">
          {/* Conversaciones */}
          <section className="profile-summary-card">
            <div className="profile-summary-card-header">
              <h3 className="detail-section-title">
                <MessageSquare size={14} />
                Conversaciones
              </h3>
              <Link to="/conversaciones" className="profile-see-all">
                Ver todas
              </Link>
            </div>

            {loading && <p className="detail-empty">Cargando...</p>}

            {!loading && conversations.length === 0 && (
              <p className="detail-empty">Sin conversaciones registradas.</p>
            )}

            {!loading && conversations.length > 0 && (
              <ul className="profile-mini-list">
                {conversations.slice(0, 3).map((conversation) => (
                  <li key={conversation.id} className="profile-mini-item">
                    <MessageSquare size={14} className="profile-mini-item-icon" />
                    <div className="profile-mini-item-body">
                      <button
                        type="button"
                        className="profile-mini-item-link"
                        onClick={() => navigate(`/clientes/${client.id}/conversaciones/${conversation.id}`)}
                      >
                        Conversación del {conversation.date}
                      </button>
                      <p className="profile-mini-item-subtitle">
                        {conversation.messageCount ? `${conversation.messageCount} mensajes` : conversation.preview}
                      </p>
                    </div>
                    <span className={conversationStatusStyles[conversation.status]}>
                      {conversation.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Requerimientos */}
          <section className="profile-summary-card">
            <div className="profile-summary-card-header">
              <h3 className="detail-section-title">
                <FileText size={14} />
                Requerimientos
              </h3>
              <Link to="/requerimientos" className="profile-see-all">
                Ver todas
              </Link>
            </div>

            {loading && <p className="detail-empty">Cargando...</p>}

            {!loading && requirements.length === 0 && (
              <p className="detail-empty">Sin requerimientos registrados.</p>
            )}

            {!loading && requirements.length > 0 && (
              <ul className="profile-mini-list">
                {requirements.slice(0, 3).map((requirement) => (
                  <li key={requirement.id} className="profile-mini-item">
                    <FileText size={14} className="profile-mini-item-icon" />
                    <div className="profile-mini-item-body">
                      <button
                        type="button"
                        className="profile-mini-item-link"
                        onClick={() => navigate(`/clientes/${client.id}/requerimientos/${requirement.id}`)}
                      >
                        {requirement.title}
                      </button>
                      <p className="profile-mini-item-subtitle">
                        Hace {requirement.createdDate || requirement.dueDate || '—'}
                      </p>
                    </div>
                    <span className="requirement-status">
                      {requirement.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Propuestas */}
          <section className="profile-summary-card">
            <div className="profile-summary-card-header">
              <h3 className="detail-section-title">
                <Briefcase size={14} />
                Propuestas
              </h3>
              <span className="profile-see-all profile-see-all--muted">{proposals.length} en total</span>
            </div>

            {loading && <p className="detail-empty">Cargando...</p>}

            {!loading && proposals.length === 0 && (
              <p className="detail-empty">Sin propuestas registradas.</p>
            )}

            {!loading && proposals.length > 0 && (
              <ul className="profile-mini-list">
                {proposals.slice(0, 3).map((proposal) => (
                  <li key={proposal.id} className="profile-mini-item">
                    <Briefcase size={14} className="profile-mini-item-icon" />
                    <div className="profile-mini-item-body">
                      <button
                        type="button"
                        className="profile-mini-item-link"
                        onClick={() => navigate(`/clientes/${client.id}/propuestas/${proposal.id}`)}
                      >
                        {proposal.title}
                      </button>
                      <p className="profile-mini-item-subtitle">Creada el {proposal.createdDate}</p>
                    </div>
                    <span className={proposalStatusStyles[proposal.status] || 'proposal-status'}>
                      {proposal.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </section>
  );
};
