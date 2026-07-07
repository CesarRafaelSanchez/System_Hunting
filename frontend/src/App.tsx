import { AppRouter } from './router';

// El componente App ahora es puramente un contenedor estructural para el Enrutador Maestro.
// Los interceptores globales (401) se despacharán desde api.client.ts directamente.

function App() {
  return (
    <div style={{ fontFamily: 'Inter, Roboto, sans-serif' }}>
      <AppRouter />
    </div>
  );
}

export default App;
