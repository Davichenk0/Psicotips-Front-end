import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, GraduationCap, LayoutDashboard, Briefcase, Users, Zap } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Cada elemento con "path" navega de verdad; los que no tienen path siguen siendo decorativos por ahora.
  // "Conversaciones" y "Requerimientos" ya no van aquí: ahora viven dentro del perfil de cada cliente.
  const menuItems = [
    { name: 'Resumen', icon: <LayoutDashboard size={16} />, path: null },
    { name: 'Clientes', icon: <Users size={16} />, path: '/' },
    { name: 'Propuestas', icon: <Briefcase size={16} />, path: null },
    { name: 'Conocimiento', icon: <GraduationCap size={16} />, path: null },
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Encabezado de marca e identidad de la aplicación. */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <Zap size={16} fill="currentColor" />
          </div>
          CogniFlow
        </div>
        {/* La navegación principal mantiene la barra compacta y fácil de escanear. */}
        <nav className="sidebar-menu">
          <p className="sidebar-section-label">Principal</p>
          {menuItems.map((item) => {
            const isActive = item.path !== null && location.pathname === item.path;

            return (
              <button
                key={item.name}
                className={`sidebar-menu-item ${isActive ? 'sidebar-menu-item--active' : ''}`}
                onClick={() => item.path && navigate(item.path)}
                disabled={!item.path}
              >
                {item.icon}
                {item.name}
                {isActive ? <ChevronRight size={16} className="sidebar-menu-arrow" /> : null}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Bloque compacto de cuenta al pie de la barra de navegación. */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-avatar">N</div>
        <div>
          <p className="sidebar-footer-name">Admin</p>
          <p className="sidebar-footer-email">admin@cogniflow.co</p>
        </div>
      </div>
    </aside>
  );
};