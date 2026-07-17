import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronUp } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useAuth } from '../../context/AuthContext';
import { ConversationMessage, getConversationMessages } from '../../services/crmService';

const PAGE_SIZE = 20;

// Vista de hilo completo de una conversación. Los mensajes se cargan por bloques
// (los más recientes primero) en vez de traer todo el historial de una sola vez,
// para que el chat no tarde en abrir ni trabe la página cuando hay muchos mensajes.
export const ConversationThreadPage = () => {
  const { clientId, conversationId } = useParams<{ clientId: string; conversationId: string }>();
  const navigate = useNavigate();
  const { clients, selectedClient } = useClients();
  const { token } = useAuth();

  const client = selectedClient?.id === clientId ? selectedClient : clients.find((c) => c.id === clientId);

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Primera carga: trae el bloque más reciente y deja el scroll abajo del todo (como WhatsApp).
  useEffect(() => {
    if (!client || !token || !conversationId) {
      return;
    }

    let cancelled = false;

    const loadFirstPage = async () => {
      setLoadingInitial(true);
      const page = await getConversationMessages(client.id, conversationId, token, 0, PAGE_SIZE);

      if (!cancelled) {
        setMessages(page.messages);
        setHasMore(page.hasMore);
        setTotal(page.total);
        setLoadingInitial(false);
      }
    };

    loadFirstPage();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, token, conversationId]);

  // Después de la primera carga, deja el scroll abajo del todo.
  useEffect(() => {
    if (!loadingInitial && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [loadingInitial]);

  // Carga el siguiente bloque de mensajes más viejos y mantiene la posición del scroll
  // donde estaba (para que no "salte" hacia abajo al insertar mensajes arriba).
  const loadOlderMessages = async () => {
    if (!client || !token || !conversationId || loadingMore) {
      return;
    }

    setLoadingMore(true);
    const container = scrollRef.current;
    const previousScrollHeight = container?.scrollHeight ?? 0;

    const page = await getConversationMessages(client.id, conversationId, token, messages.length, PAGE_SIZE);

    setMessages((prev) => [...page.messages, ...prev]);
    setHasMore(page.hasMore);
    setLoadingMore(false);

    // Restaura la posición de scroll relativa a lo que ya se estaba viendo.
    requestAnimationFrame(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - previousScrollHeight;
      }
    });
  };

  return (
    <section className="thread-page">
      <button
        type="button"
        className="profile-back"
        onClick={() => navigate(client ? `/clientes/${client.id}` : '/')}
      >
        <ArrowLeft size={14} />
        Volver al perfil
      </button>

      <div className="thread-card">
        <div className="thread-header">
          <div>
            <h1 className="thread-title">Conversación con {client?.name || 'el cliente'}</h1>
            <p className="thread-subtitle">
              {total > 0 ? `${total} mensajes en total` : 'Historial de la conversación'}
            </p>
          </div>
        </div>

        <div className="thread-scroll" ref={scrollRef}>
          {loadingInitial && <p className="detail-empty">Cargando conversación...</p>}

          {!loadingInitial && messages.length === 0 && (
            <p className="detail-empty">Esta conversación todavía no tiene mensajes.</p>
          )}

          {!loadingInitial && messages.length > 0 && (
            <>
              {hasMore && (
                <button type="button" className="thread-load-more" onClick={loadOlderMessages} disabled={loadingMore}>
                  <ChevronUp size={13} />
                  {loadingMore ? 'Cargando...' : 'Cargar mensajes anteriores'}
                </button>
              )}

              <div className="thread-messages">
                {messages.map((message) => (
                  <div key={message.id} className={`thread-bubble-row thread-bubble-row--${message.sender}`}>
                    <div className={`thread-bubble thread-bubble--${message.sender}`}>
                      <p className="thread-bubble-text">{message.text}</p>
                      <span className="thread-bubble-time">{message.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
