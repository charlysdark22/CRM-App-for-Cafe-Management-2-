import { useState, useEffect } from 'react';
import { cargarDatos, AppData } from '../utils/storage';
import { 
  Coffee, 
  Package, 
  TrendingUp, 
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Cantina() {
  const [datos, setDatos] = useState<AppData | null>(null);
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes'>('hoy');

  useEffect(() => {
    setDatos(cargarDatos());
  }, []);

  if (!datos) return null;

  const local = datos.locales.find(l => l.id === 'local-001');
  if (!local) return null;

  // Filtrar productos de cantina
  const productosCantina = local.almacen.filter(p => p.categoria === 'cantina');
  const productosCantinaAlmacenCentral = datos.almacenCentral.filter(p => p.categoria === 'cantina');

  // Calcular movimientos según el periodo
  const obtenerFechaInicio = () => {
    const hoy = new Date();
    switch (periodo) {
      case 'hoy':
        return new Date(hoy.toISOString().split('T')[0]);
      case 'semana':
        const semana = new Date(hoy);
        semana.setDate(semana.getDate() - 7);
        return semana;
      case 'mes':
        const mes = new Date(hoy);
        mes.setMonth(mes.getMonth() - 1);
        return mes;
      default:
        return hoy;
    }
  };

  const fechaInicio = obtenerFechaInicio();

  // Calcular entradas (suministros del almacén central)
  const entradas = datos.movimientos.filter(m => {
    const productoEsCantina = productosCantina.some(p => p.id === m.productoId);
    return (
      m.tipo === 'suministro' &&
      m.destino === 'local-001' &&
      productoEsCantina &&
      new Date(m.fecha) >= fechaInicio
    );
  });

  const totalEntradas = entradas.reduce((sum, m) => sum + m.cantidad, 0);

  // Calcular consumos (gastos de las mesas)
  const consumos = datos.movimientos.filter(m => {
    const productoEsCantina = productosCantina.some(p => p.id === m.productoId);
    return (
      m.tipo === 'consumo' &&
      productoEsCantina &&
      new Date(m.fecha) >= fechaInicio
    );
  });

  const totalConsumos = consumos.reduce((sum, m) => sum + m.cantidad, 0);

  // Calcular stock actual y faltantes
  const stockActual = productosCantina.reduce((sum, p) => sum + p.cantidad, 0);
  const productosBajoStock = productosCantina.filter(p => p.cantidad < 10);

  // Preparar datos para el gráfico de movimientos por producto
  const datosGrafico = productosCantina.map(producto => {
    const entradasProducto = entradas
      .filter(m => m.productoId === producto.id)
      .reduce((sum, m) => sum + m.cantidad, 0);
    
    const consumosProducto = consumos
      .filter(m => m.productoId === producto.id)
      .reduce((sum, m) => sum + m.cantidad, 0);

    return {
      nombre: producto.nombre,
      entradas: entradasProducto,
      consumos: consumosProducto,
      stock: producto.cantidad
    };
  }).filter(d => d.entradas > 0 || d.consumos > 0 || d.stock > 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-500 p-3 rounded-lg">
            <Coffee className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">Cantina - Cafe Avellaneda</h1>
            <p className="text-gray-600">Reportes e inventario de cantina</p>
          </div>
        </div>
      </div>

      {/* Selector de periodo */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Periodo:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriodo('hoy')}
              className={`px-4 py-2 rounded-lg transition ${
                periodo === 'hoy'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setPeriodo('semana')}
              className={`px-4 py-2 rounded-lg transition ${
                periodo === 'semana'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Última Semana
            </button>
            <button
              onClick={() => setPeriodo('mes')}
              className={`px-4 py-2 rounded-lg transition ${
                periodo === 'mes'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Último Mes
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="size-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600">Entradas</p>
              <p className="text-gray-900">{totalEntradas.toFixed(2)} unidades</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="size-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600">Consumos</p>
              <p className="text-gray-900">{totalConsumos.toFixed(2)} unidades</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="size-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600">Stock Actual</p>
              <p className="text-gray-900">{stockActual.toFixed(2)} unidades</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertCircle className="size-6 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-600">Bajo Stock</p>
              <p className="text-gray-900">{productosBajoStock.length} productos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de movimientos */}
      {datosGrafico.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <h2 className="text-gray-900 mb-4">Movimientos por Producto</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entradas" fill="#10B981" name="Entradas" />
              <Bar dataKey="consumos" fill="#EF4444" name="Consumos" />
              <Bar dataKey="stock" fill="#3B82F6" name="Stock Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla de inventario */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 bg-blue-50 border-b border-blue-200">
          <h2 className="text-gray-900">Inventario de Cantina - Local</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Producto</th>
                <th className="px-6 py-4 text-left text-gray-700">Stock Local</th>
                <th className="px-6 py-4 text-left text-gray-700">Stock Central</th>
                <th className="px-6 py-4 text-left text-gray-700">Unidad</th>
                <th className="px-6 py-4 text-left text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productosCantina.map(producto => {
                const productoCentral = productosCantinaAlmacenCentral.find(p => p.id === producto.id);
                
                return (
                  <tr key={producto.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Coffee className="size-5 text-blue-600" />
                        </div>
                        <span className="text-gray-900">{producto.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${producto.cantidad < 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {producto.cantidad.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {productoCentral ? productoCentral.cantidad.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{producto.unidad}</td>
                    <td className="px-6 py-4">
                      {producto.cantidad < 5 ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">Crítico</span>
                      ) : producto.cantidad < 10 ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">Bajo</span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas de productos */}
      {productosBajoStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="size-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-orange-900 mb-2">Productos con Stock Bajo</h3>
              <p className="text-orange-700 mb-4">
                Los siguientes productos de cantina tienen menos de 10 unidades. Se recomienda solicitar suministro del almacén central.
              </p>
              <div className="flex flex-wrap gap-2">
                {productosBajoStock.map(p => (
                  <span key={p.id} className="bg-white px-3 py-1 rounded-lg text-orange-800 border border-orange-200">
                    {p.nombre}: {p.cantidad.toFixed(2)} {p.unidad}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
