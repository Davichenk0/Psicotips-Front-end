import React from 'react';
import { Bell, LogOut, Search, Settings, UserPlus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ClientTable } from './ClientTable';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
	const { logout } = useAuth();

	return (
		<div className="app-shell">
			<Sidebar />

			<main className="app-main">
				{/* La barra superior mantiene las acciones ligeras y separadas de la tabla. */}
				<header className="topbar">
					<label className="topbar-search">
						<Search className="topbar-search-icon" size={14} />
						<input
							type="search"
							placeholder="Buscar clientes, conversaciones..."
						/>
					</label>

					<div className="topbar-actions">
						<button type="button" className="icon-button" aria-label="Notificaciones">
							<Bell size={15} />
						</button>
						<button type="button" className="icon-button" aria-label="Configuracion">
							<Settings size={15} />
						</button>
						{/* Acción explícita de cierre de sesión para que el usuario pueda salir desde el encabezado. */}
						<button type="button" className="topbar-logout" onClick={logout} aria-label="Cerrar sesión">
							<LogOut size={14} />
							Salir
						</button>
						<button type="button" className="topbar-avatar" aria-label="Usuario">
							AD
						</button>
					</div>
				</header>

				{/* El contenido principal está centrado y deliberadamente despejado para coincidir con la captura. */}
				<section className="clients-page">
					<div className="clients-header">
						<div>
							<h1 className="clients-title">Clientes</h1>
							<p className="clients-subtitle">7 clientes registrados</p>
						</div>

						<button
							type="button"
							className="new-client-button"
						>
							<UserPlus size={15} />
							Nuevo cliente
						</button>
					</div>

					<div className="clients-content">
						<ClientTable />
					</div>
				</section>
			</main>
		</div>
	);
};
