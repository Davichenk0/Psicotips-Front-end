import React from 'react';
import { ChevronRight, GraduationCap, LayoutDashboard, MessageSquare, FileText, Briefcase, Users, Zap } from 'lucide-react';

export const Sidebar = () => {
  // El estado activo queda fijo en el módulo de Clientes en esta vista.
  const menuItems = [
    { name: 'Resumen', icon: <LayoutDashboard size={16} />, active: false },        // Elemento de menú que representa la sección de resumen del dashboard.
    { name: 'Clientes', icon: <Users size={16} />, active: true },                  // Elemento de menú que representa la sección de clientes del dashboard, actualmente activo.
    { name: 'Conversaciones', icon: <MessageSquare size={16} />, active: false },   // Elemento de menú que representa la sección de conversaciones del dashboard.
    { name: 'Requerimientos', icon: <FileText size={16} />, active: false },        // Elemento de menú que representa la sección de requerimientos del dashboard.
    { name: 'Propuestas', icon: <Briefcase size={16} />, active: false },           // Elemento de menú que representa la sección de propuestas del dashboard.
    { name: 'Conocimiento', icon: <GraduationCap size={16} />, active: false },     // Elemento de menú que representa la sección de conocimiento del dashboard.
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
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`sidebar-menu-item ${item.active ? 'sidebar-menu-item--active' : ''}`}
            >
              {item.icon}
              {item.name}
              {item.active ? <ChevronRight size={16} className="sidebar-menu-arrow" /> : null}
            </button>
          ))}
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