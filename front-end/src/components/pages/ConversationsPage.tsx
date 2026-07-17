import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, FileText, Mail, Radio, CalendarDays, User, Hash } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useAuth } from '../../context/AuthContext';
import { ClientPickerList } from '../ClientPickerList';
import {
  Conversation,
  Requirement,
  getClientConversations,
  getClientRequirements,
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

const priorityStyles: Record<Requirement['priority'], string> = {
  Alta: 'priority-badge priority-badge--high',
  Media: 'priority-badge priority-badge--medium',
  Baja: 'priority-badge priority-badge--low',
};

// Página de Conversaciones: selecciona un cliente en la lista de la izquierda y muestra,
// a la derecha, toda su información junto con el historial completo de conversaciones
// y una vista rápida de sus requerimientos.
export const ConversationsPage = () => {
  const { selectedClient } = useClients();
  const navigate = useNavigate();
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

    const loadData = async () => {
      setLoading(true);
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

    loadData();

    return () => {
      cancelled = true;
    };
  }, [selectedClient, token]);

  return (
    <section className="master-detail-page">
      <div className="master-detail-page-header">
        <h1 className="clients-title">Conversaciones</h1>
        <p className="clients-subtitle">Selecciona un cliente para ver su historial completo.</p>
      </div>

      <div className="master-detail">
        <ClientPickerList />

        <div className="master-detail-content">
          {!selectedClient && (
            <div className="master-detail-placeholder">
              <MessageSquare size={22} />
              <p>Selecciona un cliente de la lista para ver sus conversaciones.</p>
            </div>
          )}

          {selectedClient && (
            <>
              {/* Info completa del cliente */}
              <div className="detail-client-cell">
                <div className="detail-avatar detail-avatar--lg">
                  {selectedClient.name
                    .split(' ')
                    .map((word) => word[0])
                    .join('')
                    .substring(0, 2)}
                </div>
                <div>
                  <h2 className="detail-client-name">{selectedClient.name}</h2>
                  <span className={statusStyles[selectedClient.status]}>{selectedClient.status}</span>
                </div>
              </div>

              <dl className="detail-meta detail-meta--row">
                <div className="detail-meta-item">
                  <Mail size={13} />
                  <span>{selectedClient.company || 'Sin empresa'}</span>
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

              {/* Historial completo de conversaciones */}
              <section className="detail-section">
                <h3 className="detail-section-title">
                  <MessageSquare size={14} />
                  Historial de conversaciones
                </h3>

                {loading && <p className="detail-empty">Cargando conversaciones...</p>}

                {!loading && conversations.length === 0 && (
                  <p className="detail-empty">Este cliente todavía no tiene conversaciones registradas.</p>
                )}

                {!loading && conversations.length > 0 && (
                  <ul className="detail-list">
                    {conversations.map((conversation) => (
                      <li
                        key={conversation.id}
                        className="detail-list-item detail-list-item--clickable"
                        onClick={() => selectedClient && navigate(`/clientes/${selectedClient.id}/conversaciones/${conversation.id}`)}
                      >
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
              </section>

              {/* Vista rápida de requerimientos, sin todo el detalle */}
              <section className="detail-section">
                <h3 className="detail-section-title">
                  <FileText size={14} />
                  Requerimientos (vista rápida)
                </h3>

                {!loading && requirements.length === 0 && (
                  <p className="detail-empty">Este cliente todavía no tiene requerimientos registrados.</p>
                )}

                {!loading && requirements.length > 0 && (
                  <ul className="mini-list">
                    {requirements.map((requirement) => (
                      <li key={requirement.id} className="mini-list-item">
                        <span className="mini-list-item-title">{requirement.title}</span>
                        <span className={priorityStyles[requirement.priority]}>{requirement.priority}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
