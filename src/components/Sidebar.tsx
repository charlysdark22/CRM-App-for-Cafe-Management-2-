import { 
  LayoutDashboard, 
  Warehouse, 
  Store, 
  UtensilsCrossed, 
  Coffee, 
  FileText, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  paginaActual: string;
  onCambiarPagina: (pagina: string) => void;
  onCerrarSesion: () => void;
  nombreUsuario: string;
}

export function Sidebar({ paginaActual, onCambiarPagina, onCerrarSesion, nombreUsuario }: SidebarProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const menuItems = [
    { id: 'dashboard', nombre: 'Dashboard', icono: LayoutDashboard },
    { id: 'almacen-central', nombre: 'Almacén Central', icono: Warehouse },
    { id: 'locales', nombre: 'Locales', icono: Store },
    { id: 'mesas', nombre: 'Mesas y Pedidos', icono: UtensilsCrossed },
    { id: 'cocina', nombre: 'Cocina', icono: UtensilsCrossed },
    { id: 'cantina', nombre: 'Cantina', icono: Coffee },
    { id: 'informes', nombre: 'Informes', icono: FileText },
  ];

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-indigo-600 text-white p-2 rounded-lg shadow-lg"
      >
        {menuAbierto ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white transform transition-transform duration-300 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-indigo-700">
            <h1 className="text-white mb-2">CRM Locales</h1>
            <p className="text-indigo-200">{nombreUsuario}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-indigo-700 rounded-full text-indigo-100">
              SuperAdmin
            </span>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icono = item.icono;
                const activo = paginaActual === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onCambiarPagina(item.id);
                        setMenuAbierto(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        activo
                          ? 'bg-indigo-700 text-white'
                          : 'text-indigo-100 hover:bg-indigo-700/50'
                      }`}
                    >
                      <Icono className="size-5" />
                      <span>{item.nombre}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-indigo-700">
            <button
              onClick={onCerrarSesion}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-red-600 transition"
            >
              <LogOut className="size-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay móvil */}
      {menuAbierto && (
        <div
          onClick={() => setMenuAbierto(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
}
