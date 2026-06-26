import React from 'react';
import { Bell, LogOut, Search, Settings, UserPlus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ClientTable } from './ClientTable';
import { useAuth } from '../context/AuthContext';

// El componente Dashboard es responsable de mostrar la interfaz principal de la aplicación, 
// incluyendo la barra lateral, la barra superior y la tabla de clientes.
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

				{/* El contenido principal está centrado para coincidir con la captura. */}
				<section className="clients-page">
					<div className="clients-header">
						<div>
							{/* Título y subtítulo de la sección de clientes, proporcionando contexto al usuario. */}
							<h1 className="clients-title">Clientes</h1>
							<p className="clients-subtitle">7 clientes registrados</p>
						</div>

						{/* Botón para agregar un nuevo cliente */}
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
