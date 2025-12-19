import { useState, useEffect } from 'react';
import { cargarDatos, guardarDatos, AppData, Producto, Movimiento } from '../utils/storage';
import { 
  Package, 
  ArrowLeft,
  TrendingDown,
  Search,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AlmacenLocalProps {
  localId: string;
  onVolver: () => void;
}

export function AlmacenLocal({ localId, onVolver }: AlmacenLocalProps) {
  const [datos, setDatos] = useState<AppData | null>(null);
  const [modalSuministro, setModalSuministro] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [productosSuministro, setProductosSuministro] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    setDatos(cargarDatos());
  }, []);

  const actualizarDatos = () => {
    setDatos(cargarDatos());
  };

  const realizarSuministro = () => {
    if (!datos) return;

    const local = datos.locales.find(l => l.id === localId);
    if (!local) return;

    let errores = 0;
    const movimientos: Movimiento[] = [];

    Object.keys(productosSuministro).forEach(productoId => {
      const cantidad = productosSuministro[productoId];
      if (cantidad <= 0) return;

      // Buscar en almacén central
      const productoCentral = datos.almacenCentral.find(p => p.id === productoId);
      if (!productoCentral) return;

      // Validar que hay suficiente stock
      if (productoCentral.cantidad < cantidad) {
        toast.error(`Stock insuficiente de ${productoCentral.nombre}. Disponible: ${productoCentral.cantidad}`);
        errores++;
        return;
      }

      // Descontar del almacén central
      productoCentral.cantidad -= cantidad;
      productoCentral.fechaActualizacion = new Date().toISOString();

      // Agregar al almacén local
      const productoLocal = local.almacen.find(p => p.id === productoId);
      if (productoLocal) {
        productoLocal.cantidad += cantidad;
        productoLocal.fechaActualizacion = new Date().toISOString();
      } else {
        local.almacen.push({
          ...productoCentral,
          cantidad: cantidad,
          fechaActualizacion: new Date().toISOString()
        });
      }

      // Registrar movimiento
      movimientos.push({
        id: `m${Date.now()}-${productoId}`,
        tipo: 'suministro',
        productoId: productoId,
        cantidad: cantidad,
        origen: 'almacen-central',
        destino: localId,
        fecha: new Date().toISOString()
      });
    });

    if (errores === 0 && movimientos.length > 0) {
      datos.movimientos.push(...movimientos);
      guardarDatos(datos);
      toast.success(`Se suministraron ${movimientos.length} productos correctamente`);
      setProductosSuministro({});
      setModalSuministro(false);
      actualizarDatos();
    } else if (movimientos.length === 0) {
      toast.error('No se seleccionaron productos para suministrar');
    }
  };

  if (!datos) return null;

  const local = datos.locales.find(l => l.id === localId);
  if (!local) return null;

  const productosFiltrados = local.almacen.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const productosCocina = productosFiltrados.filter(p => p.categoria === 'cocina');
  const productosCantina = productosFiltrados.filter(p => p.categoria === 'cantina');

  // Calcular totales
  const entradasHoy = datos.movimientos.filter(m => {
    const hoy = new Date().toISOString().split('T')[0];
    return m.fecha.startsWith(hoy) && m.tipo === 'suministro' && m.destino === localId;
  }).reduce((sum, m) => sum + m.cantidad, 0);

  const gastosHoy = datos.movimientos.filter(m => {
    const hoy = new Date().toISOString().split('T')[0];
    return m.fecha.startsWith(hoy) && m.tipo === 'consumo' && m.destino === localId;
  }).reduce((sum, m) => sum + m.cantidad, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <ArrowLeft className="size-5" />
          Volver a Locales
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">{local.nombre}</h1>
            <p className="text-gray-600">Almacén del local</p>
          </div>
          <button
            onClick={() => setModalSuministro(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <RefreshCw className="size-5" />
            Solicitar Suministro
          </button>
        </div>
      </div>

      {/* Métricas del día */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingDown className="size-6 text-green-600 rotate-180" />
            </div>
            <div>
              <p className="text-gray-600">Entradas Hoy</p>
              <p className="text-gray-900">{entradasHoy.toFixed(2)} unidades</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="size-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600">Consumos Hoy</p>
              <p className="text-gray-900">{gastosHoy.toFixed(2)} unidades</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="size-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600">Total Productos</p>
              <p className="text-gray-900">{local.almacen.length} items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Sección Cocina */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-orange-500 p-2 rounded-lg">
            <Package className="size-6 text-white" />
          </div>
          <h2 className="text-gray-900">Cocina</h2>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
            {productosCocina.length} productos
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50 border-b border-orange-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Producto</th>
                  <th className="px-6 py-4 text-left text-gray-700">Cantidad</th>
                  <th className="px-6 py-4 text-left text-gray-700">Unidad</th>
                  <th className="px-6 py-4 text-left text-gray-700">Precio Unit.</th>
                  <th className="px-6 py-4 text-left text-gray-700">Valor Total</th>
                  <th className="px-6 py-4 text-left text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosCocina.length > 0 ? (
                  productosCocina.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <Package className="size-5 text-orange-600" />
                          </div>
                          <span className="text-gray-900">{producto.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${producto.cantidad < 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                          {producto.cantidad.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{producto.unidad}</td>
                      <td className="px-6 py-4 text-gray-900">${producto.precioUnitario.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-900">${(producto.cantidad * producto.precioUnitario).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {producto.cantidad < 10 ? (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">Bajo</span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">OK</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No hay productos de cocina en el almacén
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sección Cantina */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Package className="size-6 text-white" />
          </div>
          <h2 className="text-gray-900">Cantina</h2>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            {productosCantina.length} productos
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b border-blue-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Producto</th>
                  <th className="px-6 py-4 text-left text-gray-700">Cantidad</th>
                  <th className="px-6 py-4 text-left text-gray-700">Unidad</th>
                  <th className="px-6 py-4 text-left text-gray-700">Precio Unit.</th>
                  <th className="px-6 py-4 text-left text-gray-700">Valor Total</th>
                  <th className="px-6 py-4 text-left text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosCantina.length > 0 ? (
                  productosCantina.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Package className="size-5 text-blue-600" />
                          </div>
                          <span className="text-gray-900">{producto.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${producto.cantidad < 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                          {producto.cantidad.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{producto.unidad}</td>
                      <td className="px-6 py-4 text-gray-900">${producto.precioUnitario.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-900">${(producto.cantidad * producto.precioUnitario).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {producto.cantidad < 10 ? (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">Bajo</span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">OK</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No hay productos de cantina en el almacén
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Suministro */}
      {modalSuministro && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-gray-900">Solicitar Suministro desde Almacén Central</h2>
              <p className="text-gray-600 mt-1">Selecciona los productos y cantidades a suministrar</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Productos de Cocina */}
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                    <div className="bg-orange-500 p-1 rounded">
                      <Package className="size-5 text-white" />
                    </div>
                    Cocina
                  </h3>
                  <div className="space-y-2">
                    {datos.almacenCentral
                      .filter(p => p.categoria === 'cocina')
                      .map(producto => (
                        <div key={producto.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-gray-900">{producto.nombre}</p>
                            <p className="text-gray-600">Disponible: {producto.cantidad.toFixed(2)} {producto.unidad}</p>
                          </div>
                          <input
                            type="number"
                            placeholder="Cantidad"
                            value={productosSuministro[producto.id] || ''}
                            onChange={(e) => setProductosSuministro({
                              ...productosSuministro,
                              [producto.id]: parseFloat(e.target.value) || 0
                            })}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            min="0"
                            max={producto.cantidad}
                            step="0.01"
                          />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Productos de Cantina */}
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                    <div className="bg-blue-500 p-1 rounded">
                      <Package className="size-5 text-white" />
                    </div>
                    Cantina
                  </h3>
                  <div className="space-y-2">
                    {datos.almacenCentral
                      .filter(p => p.categoria === 'cantina')
                      .map(producto => (
                        <div key={producto.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-gray-900">{producto.nombre}</p>
                            <p className="text-gray-600">Disponible: {producto.cantidad.toFixed(2)} {producto.unidad}</p>
                          </div>
                          <input
                            type="number"
                            placeholder="Cantidad"
                            value={productosSuministro[producto.id] || ''}
                            onChange={(e) => setProductosSuministro({
                              ...productosSuministro,
                              [producto.id]: parseFloat(e.target.value) || 0
                            })}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            min="0"
                            max={producto.cantidad}
                            step="0.01"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => {
                  setModalSuministro(false);
                  setProductosSuministro({});
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={realizarSuministro}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="size-5" />
                Confirmar Suministro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
