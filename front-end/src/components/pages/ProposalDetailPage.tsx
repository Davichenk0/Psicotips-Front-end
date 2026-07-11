import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useAuth } from '../../context/AuthContext';
import { Proposal, getClientProposals } from '../../services/crmService';

const proposalStatusStyles: Record<string, string> = {
  Aceptada: 'proposal-status proposal-status--accepted',
  Aprobada: 'proposal-status proposal-status--accepted',
  Rechazada: 'proposal-status proposal-status--rejected',
  Pendiente: 'proposal-status proposal-status--pending',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

// Vista de detalle de una propuesta comercial: se presenta con formato de documento/PDF,
// con resumen ejecutivo, alcance, exclusiones, metodología y desglose de costos.
export const ProposalDetailPage = () => {
  const { clientId, proposalId } = useParams<{ clientId: string; proposalId: string }>();
  const navigate = useNavigate();
  const { clients, selectedClient } = useClients();
  const { token } = useAuth();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  const client = selectedClient?.id === clientId ? selectedClient : clients.find((c) => c.id === clientId);

  useEffect(() => {
    if (!client || !token) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const proposals = await getClientProposals(client.id, token, client.name, client.company);
      const found = proposals.find((p) => p.id === proposalId) || null;

      if (!cancelled) {
        setProposal(found);
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [client, token, proposalId]);

  return (
    <section className="document-page">
      <button
        type="button"
        className="profile-back"
        onClick={() => navigate(client ? `/clientes/${client.id}` : '/')}
      >
        <ArrowLeft size={14} />
        Propuestas
      </button>

      {loading && <p className="detail-empty">Cargando propuesta...</p>}

      {!loading && !proposal && <p className="detail-empty">No se encontró esta propuesta.</p>}

      {!loading && proposal && (
        <div className="proposal-sheet">
          <div className="document-header">
            <div>
              <h1 className="document-title">{proposal.title}</h1>
              <p className="document-subtitle">
                {proposal.clientName}
                {proposal.companyName ? ` — ${proposal.companyName}` : ''} · Creada el {proposal.createdDate}
              </p>
            </div>
            <span className={proposalStatusStyles[proposal.status] || 'proposal-status'}>
              {proposal.status}
            </span>
          </div>

          <div className="document-grid document-grid--wide">
            {/* Columna izquierda: contenido de la propuesta */}
            <div className="proposal-main">
              <section className="document-section">
                <h3 className="detail-section-title">Resumen ejecutivo</h3>
                <p className="document-paragraph">{proposal.executiveSummary}</p>
              </section>

              <div className="document-grid">
                <section className="document-section">
                  <h3 className="detail-section-title">Alcance incluido</h3>
                  {proposal.scopeIncluded.length > 0 ? (
                    <ul className="checklist">
                      {proposal.scopeIncluded.map((item, i) => (
                        <li key={i}>
                          <CheckCircle2 size={13} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="detail-empty">Sin alcance definido.</p>
                  )}
                </section>

                <section className="document-section">
                  <h3 className="detail-section-title">Exclusiones</h3>
                  {proposal.exclusions.length > 0 ? (
                    <ul className="checklist checklist--muted">
                      {proposal.exclusions.map((item, i) => (
                        <li key={i}>
                          <XCircle size={13} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="detail-empty">Sin exclusiones registradas.</p>
                  )}
                </section>
              </div>

              {proposal.phases.length > 0 && (
                <section className="document-section">
                  <h3 className="detail-section-title">Metodología de implementación</h3>
                  <ol className="phase-list">
                    {proposal.phases.map((phase, i) => (
                      <li key={i}>
                        <span className="phase-list-number">{i + 1}</span>
                        <div>
                          <p className="phase-list-title">{phase.phase}</p>
                          {phase.description && <p className="phase-list-description">{phase.description}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>

            {/* Columna derecha: desglose de costos */}
            <aside className="proposal-cost-card">
              <h3 className="detail-section-title">Desglose de costos</h3>

              {proposal.costBreakdown.length > 0 ? (
                <ul className="cost-list">
                  {proposal.costBreakdown.map((item) => (
                    <li key={item.id} className="cost-list-item">
                      <div className="cost-list-item-top">
                        <span>{item.label}</span>
                        <span className="cost-list-item-amount">{formatCurrency(item.amount)}</span>
                      </div>
                      {item.description && <p className="cost-list-item-description">{item.description}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="detail-empty">Sin desglose de costos.</p>
              )}

              <div className="cost-total">
                <span>Total estimado</span>
                <span className="cost-total-amount">{formatCurrency(proposal.totalEstimated)}</span>
              </div>
            </aside>
          </div>
        </div>
      )}
    </section>
  );
};
