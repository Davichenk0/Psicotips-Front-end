import React, { useEffect, useState } from 'react';
import { MessageSquare, FileText, X, Mail, Radio, CalendarDays, User, ArrowUpRight, Hash } from 'lucide-react';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import {
  Conversation,
  Requirement,
  getClientConversations,
  getClientRequirements,
} from '../services/crmService';

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

const priorityStyles: Record<Requirement['priority'], string> = {
  Alta: 'priority-badge priority-badge--high',
  Media: 'priority-badge priority-badge--medium',
  Baja: 'priority-badge priority-badge--low',
};

// Panel lateral que se abre al hacer clic en una fila de la tabla de clientes.
// Muestra la información básica del cliente junto con sus conversaciones y requerimientos.
export const ClientDetailPanel = () => {
  const { selectedClient, setSelectedClient } = useClients();
  const { token } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClient || !token) {
      setConversations([]);
      setRequirements([]);
      return;
    }

    let cancelled = false;

    const loadDetail = async () => {
      setLoading(true);
      // Ambas peticiones corren en paralelo; si alguna falla, el servicio ya devuelve un arreglo vacío.
      const [conversationsResult, requirementsResult] = await Promise.all([
        getClientConversations(selectedClient.id, token),
        getClientRequirements(selectedClient.id, token),
      ]);

      if (!cancelled) {
        setConversations(conversationsResult);
        setRequirements(requirementsResult);
        setLoading(false);
      }
    };

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedClient, token]);

  if (!selectedClient) {
    return null;
  }

  const initials = selectedClient.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2);

  return (
    <>
      {/* El fondo oscuro cierra el panel al hacer clic afuera. */}
      <div className="detail-overlay" onClick={() => setSelectedClient(null)} />

      <aside className="detail-panel">
        <div className="detail-panel-header">
          <button
            type="button"
            className="detail-close"
            onClick={() => setSelectedClient(null)}
            aria-label="Cerrar panel de detalle"
          >
            <X size={16} />
          </button>

          <div className="detail-client-cell">
            <div className="detail-avatar">{initials}</div>
            <div>
              <h2 className="detail-client-name">{selectedClient.name}</h2>
              <span className={statusStyles[selectedClient.status]}>{selectedClient.status}</span>
            </div>
          </div>

          <dl className="detail-meta">
            <div className="detail-meta-item">
              <Mail size={13} />
              <span>{selectedClient.company}</span>
            </div>
            <div className="detail-meta-item">
              <Radio size={13} />
              <span>{selectedClient.channel}</span>
            </div>
            <div className="detail-meta-item">
              <CalendarDays size={13} />
              <span>Registrado el {selectedClient.registrationDate}</span>
            </div>
          </dl>
        </div>

        <div className="detail-panel-body">
          {/* Sección de conversaciones */}
          <section className="detail-section">
            <h3 className="detail-section-title">
              <MessageSquare size={14} />
              Conversaciones
            </h3>

            {loading && <p className="detail-empty">Cargando conversaciones...</p>}

            {!loading && conversations.length === 0 && (
              <p className="detail-empty">Este cliente todavía no tiene conversaciones registradas.</p>
            )}

            {!loading && conversations.length > 0 && (
              <ul className="detail-list">
                {conversations.map((conversation) => (
                  <li key={conversation.id} className="detail-list-item">
                    <div className="detail-list-item-top">
                      <span className="detail-list-item-tag">{conversation.channel}</span>
                      <span className={conversationStatusStyles[conversation.status]}>
                        {conversation.status}
                      </span>
                    </div>
                    <p className="detail-list-item-text">{conversation.preview}</p>
                    <div className="detail-list-item-footer">
                      <span className="detail-list-item-date">{conversation.date}</span>
                      {typeof conversation.messageCount === 'number' && (
                        <span className="detail-list-item-count">
                          <Hash size={11} />
                          {conversation.messageCount} mensajes
                        </span>
                      )}
                      {conversation.assignedTo && (
                        <span className="detail-list-item-agent">
                          <User size={11} />
                          {conversation.assignedTo}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!loading && (
              <button
                type="button"
                className="detail-see-all"
                onClick={() => {
                  // TODO: enlazar al módulo de Conversaciones (Sidebar) filtrado por este cliente
                  // una vez ese módulo tenga ruteo propio.
                  console.log('Ver conversaciones completas de', selectedClient.id);
                }}
              >
                Ver todas las conversaciones
                <ArrowUpRight size={13} />
              </button>
            )}
          </section>

          {/* Sección de requerimientos */}
          <section className="detail-section">
            <h3 className="detail-section-title">
              <FileText size={14} />
              Requerimientos
            </h3>

            {loading && <p className="detail-empty">Cargando requerimientos...</p>}

            {!loading && requirements.length === 0 && (
              <p className="detail-empty">Este cliente todavía no tiene requerimientos registrados.</p>
            )}

            {!loading && requirements.length > 0 && (
              <ul className="detail-list">
                {requirements.map((requirement) => (
                  <li key={requirement.id} className="detail-list-item">
                    <div className="detail-list-item-top">
                      <span className="detail-list-item-title">{requirement.title}</span>
                      <span className={priorityStyles[requirement.priority]}>
                        {requirement.priority}
                      </span>
                    </div>
                    <p className="detail-list-item-text">{requirement.description}</p>
                    <div className="detail-list-item-footer">
                      <span className="requirement-status">{requirement.status}</span>
                      {requirement.type && (
                        <span className="detail-list-item-type">{requirement.type}</span>
                      )}
                      {requirement.assignedTo && (
                        <span className="detail-list-item-agent">
                          <User size={11} />
                          {requirement.assignedTo}
                        </span>
                      )}
                    </div>
                    {(requirement.createdDate || requirement.dueDate) && (
                      <p className="detail-list-item-due">
                        {requirement.createdDate && <>Creado el {requirement.createdDate}</>}
                        {requirement.createdDate && requirement.dueDate && ' · '}
                        {requirement.dueDate && <>Fecha límite: {requirement.dueDate}</>}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </>
  );
};
