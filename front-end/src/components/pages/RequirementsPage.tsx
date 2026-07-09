import React, { useEffect, useState } from 'react';
import { FileText, Mail, Radio, CalendarDays, User, Sparkles } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useAuth } from '../../context/AuthContext';
import { ClientPickerList } from '../ClientPickerList';
import { Requirement, getClientRequirements } from '../../services/crmService';

const statusStyles = {
  Activo: 'status-badge status-badge--active',
  Prospecto: 'status-badge status-badge--prospect',
  Inactivo: 'status-badge status-badge--inactive',
};

const priorityStyles: Record<Requirement['priority'], string> = {
  Alta: 'priority-badge priority-badge--high',
  Media: 'priority-badge priority-badge--medium',
  Baja: 'priority-badge priority-badge--low',
};

// Página de Requerimientos: selecciona un cliente en la lista de la izquierda y muestra,
// a la derecha, todos sus requerimientos junto con la posible solución sugerida por el bot.
export const RequirementsPage = () => {
  const { selectedClient } = useClients();
  const { token } = useAuth();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClient || !token) {
      setRequirements([]);
      return;
    }

    let cancelled = false;

    const loadRequirements = async () => {
      setLoading(true);
      const result = await getClientRequirements(selectedClient.id, token);

      if (!cancelled) {
        setRequirements(result);
        setLoading(false);
      }
    };

    loadRequirements();

    return () => {
      cancelled = true;
    };
  }, [selectedClient, token]);

  return (
    <section className="master-detail-page">
      <div className="master-detail-page-header">
        <h1 className="clients-title">Requerimientos</h1>
        <p className="clients-subtitle">Selecciona un cliente para ver todos sus requerimientos.</p>
      </div>

      <div className="master-detail">
        <ClientPickerList />

        <div className="master-detail-content">
          {!selectedClient && (
            <div className="master-detail-placeholder">
              <FileText size={22} />
              <p>Selecciona un cliente de la lista para ver sus requerimientos.</p>
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

              {/* Todos los requerimientos, con la solución que sugiere el bot */}
              <section className="detail-section">
                <h3 className="detail-section-title">
                  <FileText size={14} />
                  Todos los requerimientos
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
                          <span className={priorityStyles[requirement.priority]}>{requirement.priority}</span>
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

                        {/* Posible solución sugerida por el bot */}
                        {requirement.botSolution && (
                          <div className="bot-solution">
                            <span className="bot-solution-label">
                              <Sparkles size={12} />
                              Posible solución del bot
                            </span>
                            <p className="bot-solution-text">{requirement.botSolution}</p>
                          </div>
                        )}
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
