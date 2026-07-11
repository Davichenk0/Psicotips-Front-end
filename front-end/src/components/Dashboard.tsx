import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Bell, LogOut, Search, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ClientsPage } from './pages/ClientsPage';
import { ClientProfilePage } from './pages/ClientProfilePage';
import { RequirementDetailPage } from './pages/RequirementDetailPage';
import { ProposalDetailPage } from './pages/ProposalDetailPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { RequirementsPage } from './pages/RequirementsPage';
import { useAuth } from '../context/AuthContext';

// El componente Dashboard es responsable de mostrar la interfaz principal de la aplicación,
// incluyendo la barra lateral, la barra superior y el contenido de la página activa.
export const Dashboard = () => {
	const { logout } = useAuth();

	return (
		<div className="app-shell">
			<Sidebar />

			<main className="app-main">
				{/* La barra superior mantiene las acciones ligeras y separadas del contenido. */}
				<header className="topbar">
					<label className="topbar-search">
						<Search className="topbar-search-icon" size={14} />
						<input
							type="search"
							placeholder="Buscar clientes, conversaciones..."
						/>
					</label>

					<div className="topbar-actions">
						{/* Botones de acción para notificaciones*/}
						<button type="button" className="icon-button" aria-label="Notificaciones">
							<Bell size={15} />
						</button>
						{/* Botón de acción para configuración */}
						<button type="button" className="icon-button" aria-label="Configuracion">
							<Settings size={15} />
						</button>
						{/* Acción explícita de cierre de sesión desde el encabezado. */}
						<button type="button" className="topbar-logout" onClick={logout} aria-label="Cerrar sesión">
							<LogOut size={14} />
							Salir
						</button>
						{/* Avatar del usuario con iniciales, que podría expandirse para mostrar un menú de usuario. */}
						<button type="button" className="topbar-avatar" aria-label="Usuario">
							AD
						</button>
					</div>
				</header>

				{/* El contenido cambia según la ruta activa (Clientes, Conversaciones o Requerimientos). */}
				<Routes>
					<Route path="/" element={<ClientsPage />} />
					<Route path="/clientes/:clientId" element={<ClientProfilePage />} />
					<Route path="/clientes/:clientId/requerimientos/:reqId" element={<RequirementDetailPage />} />
					<Route path="/clientes/:clientId/propuestas/:proposalId" element={<ProposalDetailPage />} />
					<Route path="/conversaciones" element={<ConversationsPage />} />
					<Route path="/requerimientos" element={<RequirementsPage />} />
				</Routes>
			</main>
		</div>
	);
};
