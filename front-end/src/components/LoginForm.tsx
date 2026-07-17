import React, { useState } from 'react';
import { loginRequest } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import logoPsicotips from '../assets/Logo.png';
import './LoginForm.css';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginRequest(email, password);

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-panel login-panel--form" aria-label="Formulario de inicio de sesion">
        <header className="login-brand">
          <img src={logoPsicotips} alt="PsicoTips" className="login-brand-logo" />
          <span className="login-brand-name">PsicoTips</span>
        </header>

        <div className="login-content">
          <h1 className="login-title">Iniciar sesion</h1>
          <p className="login-subtitle">Accede a tu panel de clientes de PsicoTips.</p>

          {error && <p className="login-error">{error}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Correo electronico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                placeholder="tu.correo@empresa.com"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                placeholder="Ingresa tu contrasena"
              />
            </div>

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="login-footnote">
            Al continuar, aceptas las condiciones de uso y politica de privacidad de PsicoTips.
          </p>
        </div>

        {/*<div className="login-bottom-link">
          <span>Necesitas ayuda para entrar?</span>
          <a href="mailto:soporte@psicotips.com">Contactar soporte</a>
        </div>*/}
      </section>

      <section className="login-panel login-panel--quote" aria-label="Mensaje de marca">
        <div className="login-quote-wrap">
          <p className="login-quote-mark">{'//'}</p>
          <p className="login-quote">
            En Psicotips no solo te decimos hacia dónde ir; estructuramos tus bases operativas 
            y te conectamos con los aliados estratégicos (proveedores) que te ayudarán a llegar allí. 
            Simplificamos la gestión empresarial para que te enfoques en crecer.
          </p>
          <div className="login-quote-author">
            <span className="login-avatar">PT</span>
            <span>@psicotips</span>
          </div>
        </div>
      </section>
    </main>
  );
};