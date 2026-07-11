import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Target, AlertTriangle } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useAuth } from '../../context/AuthContext';
import { Requirement, getClientRequirements } from '../../services/crmService';

const priorityLevelStyles: Record<Requirement['priority'], string> = {
  Alta: 'priority-badge priority-badge--high',
  Media: 'priority-badge priority-badge--medium',
  Baja: 'priority-badge priority-badge--low',
};

// Vista de detalle de un requerimiento específico: documento estructurado con necesidades,
// objetivos, alcance, prioridades y restricciones identificadas.
export const RequirementDetailPage = () => {
  const { clientId, reqId } = useParams<{ clientId: string; reqId: string }>();
  const navigate = useNavigate();
  const { clients, selectedClient } = useClients();
  const { token } = useAuth();

  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);

  const client = selectedClient?.id === clientId ? selectedClient : clients.find((c) => c.id === clientId);

  useEffect(() => {
    if (!client || !token) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const requirements = await getClientRequirements(client.id, token);
      const found = requirements.find((r) => r.id === reqId) || null;

      if (!cancelled) {
        setRequirement(found);
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [client, token, reqId]);

  return (
    <section className="document-page">
      <button
        type="button"
        className="profile-back"
        onClick={() => navigate(client ? `/clientes/${client.id}` : '/')}
      >
        <ArrowLeft size={14} />
        Requerimientos
      </button>

      {loading && <p className="detail-empty">Cargando requerimiento...</p>}

      {!loading && !requirement && (
        <p className="detail-empty">No se encontró este requerimiento.</p>
      )}

      {!loading && requirement && (
        <>
          <div className="document-header">
            <div>
              <h1 className="document-title">{requirement.title}</h1>
              <p className="document-subtitle">
                {client?.name}
                {client?.company ? ` — ${client.company}` : ''}
                {requirement.createdDate ? ` · Creado el ${requirement.createdDate}` : ''}
              </p>
            </div>
            <span className="requirement-status">
              {requirement.status}
            </span>
          </div>

          <div className="document-grid">
            {/* Necesidades identificadas */}
            <section className="document-section">
              <h3 className="detail-section-title">
                <CheckCircle2 size={14} />
                Necesidades identificadas
              </h3>
              {requirement.identifiedNeeds && requirement.identifiedNeeds.length > 0 ? (
                <ul className="checklist">
                  {requirement.identifiedNeeds.map((need, i) => (
                    <li key={i}>
                      <CheckCircle2 size={13} />
                      <span>{need}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="detail-empty">{requirement.description}</p>
              )}
            </section>

            {/* Objetivos del proyecto */}
            <section className="document-section">
              <h3 className="detail-section-title">
                <Target size={14} />
                Objetivos del proyecto
              </h3>
              {requirement.objectives && requirement.objectives.length > 0 ? (
                <ul className="checklist">
                  {requirement.objectives.map((objective, i) => (
                    <li key={i}>
                      <Target size={13} />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="detail-empty">Sin objetivos registrados todavía.</p>
              )}
            </section>
          </div>

          {/* Alcance */}
          <section className="document-section">
            <h3 className="detail-section-title">Alcance</h3>
            <p className="document-paragraph">
              {requirement.scope || 'Todavía no se ha definido el alcance de este requerimiento.'}
            </p>
          </section>

          <div className="document-grid">
            {/* Prioridades */}
            <section className="document-section">
              <h3 className="detail-section-title">Prioridades</h3>
              {requirement.priorities && requirement.priorities.length > 0 ? (
                <ul className="priority-list">
                  {requirement.priorities.map((item, i) => (
                    <li key={i}>
                      <span>{item.label}</span>
                      <span className={priorityLevelStyles[item.level]}>{item.level}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="detail-empty">Sin prioridades desglosadas.</p>
              )}
            </section>

            {/* Restricciones */}
            <section className="document-section">
              <h3 className="detail-section-title">
                <AlertTriangle size={14} />
                Restricciones
              </h3>
              {requirement.restrictions && requirement.restrictions.length > 0 ? (
                <ul className="checklist checklist--warning">
                  {requirement.restrictions.map((restriction, i) => (
                    <li key={i}>
                      <AlertTriangle size={13} />
                      <span>{restriction}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="detail-empty">Sin restricciones registradas.</p>
              )}
            </section>
          </div>

          {requirement.botSolution && (
            <div className="bot-solution">
              <span className="bot-solution-label">Posible solución del bot</span>
              <p className="bot-solution-text">{requirement.botSolution}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
};
