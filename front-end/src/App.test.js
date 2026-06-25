import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  // Prueba base de CRA; reemplazarla por cobertura específica de la app cuando haga falta.
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
