import { useState, useEffect } from 'react';
import { Toaster } from 'sonner@2.0.3';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AlmacenCentral } from './components/AlmacenCentral';
import { Locales } from './components/Locales';
import { AlmacenLocal } from './components/AlmacenLocal';
import { MesasPedidos } from './components/MesasPedidos';
import { Cocina } from './components/Cocina';
import { Cantina } from './components/Cantina';
import { Informes } from './components/Informes';
import { ConfiguracionRespaldo } from './components/ConfiguracionRespaldo';
import { obtenerUsuarioActual, cerrarSesion } from './utils/storage';

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [paginaActual, setPaginaActual] = useState('dashboard');
  const [localSeleccionado, setLocalSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    const usuario = obtenerUsuarioActual();
    if (usuario) {
      setAutenticado(true);
    }
  }, []);

  const handleLogin = () => {
    setAutenticado(true);
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    setAutenticado(false);
    setPaginaActual('dashboard');
    setLocalSeleccionado(null);
  };

  const handleCambiarPagina = (pagina: string) => {
    setPaginaActual(pagina);
    setLocalSeleccionado(null);
  };

  const handleSeleccionarLocal = (localId: string) => {
    setLocalSeleccionado(localId);
  };

  const handleVolverLocales = () => {
    setLocalSeleccionado(null);
  };

  if (!autenticado) {
    return <Login onLogin={handleLogin} />;
  }

  const usuario = obtenerUsuarioActual();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-right" richColors />
      
      <Sidebar
        paginaActual={paginaActual}
        onCambiarPagina={handleCambiarPagina}
        onCerrarSesion={handleCerrarSesion}
        nombreUsuario={usuario?.nombre || 'Usuario'}
      />

      <div className="flex-1 lg:ml-64">
        <div className="min-h-screen">
          {paginaActual === 'dashboard' && <Dashboard />}
          
          {paginaActual === 'almacen-central' && <AlmacenCentral />}
          
          {paginaActual === 'locales' && (
            localSeleccionado ? (
              <AlmacenLocal 
                localId={localSeleccionado} 
                onVolver={handleVolverLocales}
              />
            ) : (
              <Locales onSeleccionarLocal={handleSeleccionarLocal} />
            )
          )}
          
          {paginaActual === 'mesas' && <MesasPedidos />}
          
          {paginaActual === 'cocina' && <Cocina />}
          
          {paginaActual === 'cantina' && <Cantina />}
          
          {paginaActual === 'informes' && <Informes />}
        </div>

        {/* Botón flotante para configuración de respaldo (solo para superadmin) */}
        {usuario?.rol === 'superadmin' && (
          <button
            onClick={() => {
              const modal = document.getElementById('modal-respaldo');
              if (modal) {
                modal.style.display = 'block';
              }
            }}
            className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition z-40"
            title="Configuración de Respaldo"
          >
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </button>
        )}

        {/* Modal de configuración de respaldo */}
        <div
          id="modal-respaldo"
          className="fixed inset-0 bg-black/50 z-50 hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.currentTarget.style.display = 'none';
            }
          }}
        >
          <div className="min-h-screen overflow-y-auto py-8">
            <div className="max-w-5xl mx-auto px-4">
              <div className="bg-white rounded-2xl shadow-2xl">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-gray-900">Configuración de Base de Datos</h2>
                  <button
                    onClick={() => {
                      const modal = document.getElementById('modal-respaldo');
                      if (modal) {
                        modal.style.display = 'none';
                      }
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <ConfiguracionRespaldo />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
