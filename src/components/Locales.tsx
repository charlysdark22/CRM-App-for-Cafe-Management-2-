import { useState, useEffect } from 'react';
import { cargarDatos, AppData } from '../utils/storage';
import { Store, Clock, CheckCircle, ArrowRight, Package } from 'lucide-react';

interface LocalesProps {
  onSeleccionarLocal: (localId: string) => void;
}

export function Locales({ onSeleccionarLocal }: LocalesProps) {
  const [datos, setDatos] = useState<AppData | null>(null);

  useEffect(() => {
    setDatos(cargarDatos());
  }, []);

  if (!datos) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Gestión de Locales</h1>
        <p className="text-gray-600">Administra todos los locales del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {datos.locales.map((local) => {
          const totalProductos = local.almacen.reduce((sum, p) => sum + p.cantidad, 0);
          const valorTotal = local.almacen.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);

          return (
            <div
              key={local.id}
              className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${
                local.activo ? 'hover:shadow-2xl transition cursor-pointer' : 'opacity-75'
              }`}
              onClick={() => local.activo && onSeleccionarLocal(local.id)}
            >
              <div className={`p-6 ${local.activo ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-400'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Store className="size-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white mb-1">{local.nombre}</h2>
                      {local.activo ? (
                        <div className="flex items-center gap-2 text-white/90">
                          <CheckCircle className="size-4" />
                          <span>Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-white/90">
                          <Clock className="size-4" />
                          <span>Próximamente</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {local.activo && <ArrowRight className="size-6 text-white" />}
                </div>
              </div>

              <div className="p-6">
                {local.activo ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="size-5 text-blue-600" />
                          <span className="text-gray-600">Productos</span>
                        </div>
                        <p className="text-gray-900">{local.almacen.length}</p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="size-5 text-green-600" />
                          <span className="text-gray-600">Unidades</span>
                        </div>
                        <p className="text-gray-900">{totalProductos.toFixed(0)}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg mb-4">
                      <p className="text-gray-600 mb-1">Valor Total Inventario</p>
                      <p className="text-gray-900">${valorTotal.toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => onSeleccionarLocal(local.id)}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                      Ver Detalles
                      <ArrowRight className="size-5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="size-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Este local estará disponible próximamente</p>
                    <p className="text-gray-500">En proceso de configuración</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-gray-900 mb-4">Estado del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 mb-1">Locales Activos</p>
            <p className="text-green-900">
              {datos.locales.filter(l => l.activo).length} de {datos.locales.length}
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-700 mb-1">Total Productos</p>
            <p className="text-blue-900">
              {datos.locales.reduce((sum, l) => sum + l.almacen.length, 0)} items
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-purple-700 mb-1">En Desarrollo</p>
            <p className="text-purple-900">
              {datos.locales.filter(l => !l.activo).length} locales
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
