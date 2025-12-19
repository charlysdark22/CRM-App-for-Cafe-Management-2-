import { useState, useEffect } from 'react';
import { cargarDatos, AppData } from '../utils/storage';
import { 
  TrendingUp, 
  Package, 
  Store, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export function Dashboard() {
  const [datos, setDatos] = useState<AppData | null>(null);

  useEffect(() => {
    setDatos(cargarDatos());
  }, []);

  if (!datos) return null;

  // Calcular métricas
  const totalProductosCentral = datos.almacenCentral.reduce((sum, p) => sum + p.cantidad, 0);
  const valorTotalCentral = datos.almacenCentral.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);
  
  const cafeAvellaneda = datos.locales.find(l => l.id === 'local-001');
  const totalProductosLocal = cafeAvellaneda?.almacen.reduce((sum, p) => sum + p.cantidad, 0) || 0;
  
  const productosAgotandose = datos.almacenCentral.filter(p => p.cantidad < 20).length;
  
  const movimientosHoy = datos.movimientos.filter(m => {
    const hoy = new Date().toISOString().split('T')[0];
    return m.fecha.startsWith(hoy);
  }).length;

  const productosCocina = datos.almacenCentral.filter(p => p.categoria === 'cocina').length;
  const productosCantina = datos.almacenCentral.filter(p => p.categoria === 'cantina').length;

  const tarjetas = [
    {
      titulo: 'Almacén Central',
      valor: totalProductosCentral.toFixed(0),
      subtitulo: 'unidades totales',
      icono: Package,
      color: 'bg-blue-500',
      tendencia: '+12%'
    },
    {
      titulo: 'Valor Inventario',
      valor: `$${valorTotalCentral.toFixed(2)}`,
      subtitulo: 'valor total',
      icono: TrendingUp,
      color: 'bg-green-500',
      tendencia: '+8%'
    },
    {
      titulo: 'Cafe Avellaneda',
      valor: totalProductosLocal.toFixed(0),
      subtitulo: 'unidades en local',
      icono: Store,
      color: 'bg-purple-500',
      tendencia: '-3%'
    },
    {
      titulo: 'Alertas Stock',
      valor: productosAgotandose.toString(),
      subtitulo: 'productos bajo stock',
      icono: AlertTriangle,
      color: 'bg-orange-500',
      tendencia: 'Atención'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Dashboard Principal</h1>
        <p className="text-gray-600">Resumen general del sistema de gestión</p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {tarjetas.map((tarjeta, index) => {
          const Icono = tarjeta.icono;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-start justify-between mb-4">
                <div className={`${tarjeta.color} p-3 rounded-lg`}>
                  <Icono className="size-6 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-${tarjeta.tendencia.startsWith('+') ? 'green' : tarjeta.tendencia.startsWith('-') ? 'red' : 'orange'}-600`}>
                  {tarjeta.tendencia.startsWith('+') && <ArrowUpRight className="size-4" />}
                  {tarjeta.tendencia.startsWith('-') && <ArrowDownRight className="size-4" />}
                  <span>{tarjeta.tendencia}</span>
                </span>
              </div>
              <h3 className="text-gray-900 mb-1">{tarjeta.valor}</h3>
              <p className="text-gray-600">{tarjeta.titulo}</p>
              <p className="text-gray-500 mt-1">{tarjeta.subtitulo}</p>
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de categorías */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-gray-900 mb-4">Categorías de Productos</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <Package className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-900">Cocina</p>
                  <p className="text-gray-600">{productosCocina} productos</p>
                </div>
              </div>
              <div className="text-orange-600">{((productosCocina / datos.almacenCentral.length) * 100).toFixed(0)}%</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Package className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-900">Cantina</p>
                  <p className="text-gray-600">{productosCantina} productos</p>
                </div>
              </div>
              <div className="text-blue-600">{((productosCantina / datos.almacenCentral.length) * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-gray-900 mb-4">Actividad del Sistema</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-900">Movimientos hoy</p>
                <p className="text-gray-600">Registros de inventario</p>
              </div>
              <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg">
                {movimientosHoy}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-900">Locales activos</p>
                <p className="text-gray-600">De 4 locales totales</p>
              </div>
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                1
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-900">Último respaldo</p>
                <p className="text-gray-600">{new Date(datos.ultimoRespaldo).toLocaleString('es-ES')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos con bajo stock */}
      {productosAgotandose > 0 && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="size-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-orange-900 mb-2">Alerta de Stock Bajo</h3>
              <p className="text-orange-700 mb-4">
                Hay {productosAgotandose} productos con menos de 20 unidades en el almacén central. 
                Es recomendable realizar un pedido de reposición.
              </p>
              <div className="flex flex-wrap gap-2">
                {datos.almacenCentral
                  .filter(p => p.cantidad < 20)
                  .map(p => (
                    <span key={p.id} className="bg-white px-3 py-1 rounded-lg text-orange-800 border border-orange-200">
                      {p.nombre}: {p.cantidad} {p.unidad}
                    </span>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
