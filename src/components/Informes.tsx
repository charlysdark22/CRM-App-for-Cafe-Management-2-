import { useState, useEffect } from 'react';
import { cargarDatos, AppData } from '../utils/storage';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Informes() {
  const [datos, setDatos] = useState<AppData | null>(null);
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes'>('semana');
  const [tipoInforme, setTipoInforme] = useState<'general' | 'cocina' | 'cantina'>('general');

  useEffect(() => {
    setDatos(cargarDatos());
  }, []);

  const generarPDF = () => {
    if (!datos) return;

    const contenido = generarContenidoInforme();
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-${tipoInforme}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generarContenidoInforme = (): string => {
    if (!datos) return '';

    const fecha = new Date().toLocaleString('es-ES');
    const local = datos.locales.find(l => l.id === 'local-001');
    
    let contenido = `========================================\n`;
    contenido += `INFORME ${tipoInforme.toUpperCase()}\n`;
    contenido += `Cafe Avellaneda - Sistema CRM\n`;
    contenido += `Fecha: ${fecha}\n`;
    contenido += `========================================\n\n`;

    if (tipoInforme === 'general' || tipoInforme === 'cocina') {
      contenido += `COCINA\n`;
      contenido += `--------------------------------------\n`;
      const productosCocina = local?.almacen.filter(p => p.categoria === 'cocina') || [];
      productosCocina.forEach(p => {
        contenido += `${p.nombre}: ${p.cantidad} ${p.unidad} - $${(p.cantidad * p.precioUnitario).toFixed(2)}\n`;
      });
      contenido += `\n`;
    }

    if (tipoInforme === 'general' || tipoInforme === 'cantina') {
      contenido += `CANTINA\n`;
      contenido += `--------------------------------------\n`;
      const productosCantina = local?.almacen.filter(p => p.categoria === 'cantina') || [];
      productosCantina.forEach(p => {
        contenido += `${p.nombre}: ${p.cantidad} ${p.unidad} - $${(p.cantidad * p.precioUnitario).toFixed(2)}\n`;
      });
      contenido += `\n`;
    }

    contenido += `========================================\n`;
    contenido += `FIN DEL INFORME\n`;
    contenido += `========================================\n`;

    return contenido;
  };

  if (!datos) return null;

  const local = datos.locales.find(l => l.id === 'local-001');
  if (!local) return null;

  // Calcular fechas según periodo
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

  // Filtrar productos según tipo de informe
  let productosInforme = local.almacen;
  if (tipoInforme === 'cocina') {
    productosInforme = local.almacen.filter(p => p.categoria === 'cocina');
  } else if (tipoInforme === 'cantina') {
    productosInforme = local.almacen.filter(p => p.categoria === 'cantina');
  }

  // Calcular métricas
  const entradas = datos.movimientos.filter(m => {
    const productoEnInforme = productosInforme.some(p => p.id === m.productoId);
    return (
      m.tipo === 'suministro' &&
      m.destino === 'local-001' &&
      productoEnInforme &&
      new Date(m.fecha) >= fechaInicio
    );
  });

  const consumos = datos.movimientos.filter(m => {
    const productoEnInforme = productosInforme.some(p => p.id === m.productoId);
    return (
      m.tipo === 'consumo' &&
      productoEnInforme &&
      new Date(m.fecha) >= fechaInicio
    );
  });

  const totalEntradas = entradas.reduce((sum, m) => sum + m.cantidad, 0);
  const totalConsumos = consumos.reduce((sum, m) => sum + m.cantidad, 0);
  const stockActual = productosInforme.reduce((sum, p) => sum + p.cantidad, 0);
  const valorInventario = productosInforme.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);

  // Calcular faltantes (productos con stock bajo pero nunca negativo)
  const faltantes = productosInforme.filter(p => p.cantidad < 10 && p.cantidad >= 0);
  const faltantesValor = faltantes.reduce((sum, p) => {
    const cantidadNecesaria = Math.max(0, 20 - p.cantidad); // Reponer hasta 20 unidades
    return sum + (cantidadNecesaria * p.precioUnitario);
  }, 0);

  // Datos para gráfico de tendencia
  const datosGrafico = [];
  const dias = periodo === 'hoy' ? 1 : periodo === 'semana' ? 7 : 30;
  
  for (let i = dias - 1; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    const fechaStr = fecha.toISOString().split('T')[0];

    const entradasDia = datos.movimientos.filter(m => {
      const productoEnInforme = productosInforme.some(p => p.id === m.productoId);
      return m.tipo === 'suministro' && m.destino === 'local-001' && productoEnInforme && m.fecha.startsWith(fechaStr);
    }).reduce((sum, m) => sum + m.cantidad, 0);

    const consumosDia = datos.movimientos.filter(m => {
      const productoEnInforme = productosInforme.some(p => p.id === m.productoId);
      return m.tipo === 'consumo' && productoEnInforme && m.fecha.startsWith(fechaStr);
    }).reduce((sum, m) => sum + m.cantidad, 0);

    datosGrafico.push({
      fecha: `${fecha.getDate()}/${fecha.getMonth() + 1}`,
      entradas: entradasDia,
      consumos: consumosDia
    });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Informes e Inventarios</h1>
          <p className="text-gray-600">Reportes detallados del sistema</p>
        </div>
        <button
          onClick={generarPDF}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <Download className="size-5" />
          Descargar Informe
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Tipo de Informe</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoInforme('general')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  tipoInforme === 'general'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setTipoInforme('cocina')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  tipoInforme === 'cocina'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cocina
              </button>
              <button
                onClick={() => setTipoInforme('cantina')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  tipoInforme === 'cantina'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cantina
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Periodo</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodo('hoy')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  periodo === 'hoy'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setPeriodo('semana')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  periodo === 'semana'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setPeriodo('mes')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  periodo === 'mes'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="size-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-600">Entradas</p>
              <p className="text-gray-900">{totalEntradas.toFixed(2)}</p>
              <p className="text-gray-500">unidades</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="size-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-600">Consumos</p>
              <p className="text-gray-900">{totalConsumos.toFixed(2)}</p>
              <p className="text-gray-500">unidades</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="size-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-600">Stock Actual</p>
              <p className="text-gray-900">{stockActual.toFixed(2)}</p>
              <p className="text-gray-500">unidades</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="size-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-600">Valor Inventario</p>
              <p className="text-gray-900">${valorInventario.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de tendencia */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
        <h2 className="text-gray-900 mb-4">Tendencia de Movimientos</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="entradas" stroke="#10B981" strokeWidth={2} name="Entradas" />
            <Line type="monotone" dataKey="consumos" stroke="#EF4444" strokeWidth={2} name="Consumos" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Informe de inventario actual */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 bg-indigo-50 border-b border-indigo-200">
          <h2 className="text-gray-900">Inventario Actual - {tipoInforme.charAt(0).toUpperCase() + tipoInforme.slice(1)}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Producto</th>
                <th className="px-6 py-4 text-left text-gray-700">Categoría</th>
                <th className="px-6 py-4 text-left text-gray-700">Entrada</th>
                <th className="px-6 py-4 text-left text-gray-700">Consumo</th>
                <th className="px-6 py-4 text-left text-gray-700">Stock</th>
                <th className="px-6 py-4 text-left text-gray-700">Faltante</th>
                <th className="px-6 py-4 text-left text-gray-700">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productosInforme.map(producto => {
                const entradasProducto = entradas
                  .filter(m => m.productoId === producto.id)
                  .reduce((sum, m) => sum + m.cantidad, 0);
                
                const consumosProducto = consumos
                  .filter(m => m.productoId === producto.id)
                  .reduce((sum, m) => sum + m.cantidad, 0);

                // Calcular faltante (nunca negativo)
                const stockIdeal = 20;
                const faltante = producto.cantidad < stockIdeal 
                  ? Math.max(0, stockIdeal - producto.cantidad) 
                  : 0;

                return (
                  <tr key={producto.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-900">{producto.nombre}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full ${
                        producto.categoria === 'cocina'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-green-600">
                      +{entradasProducto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      -{consumosProducto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${producto.cantidad < 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {producto.cantidad.toFixed(2)} {producto.unidad}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {faltante > 0 ? (
                        <span className="text-orange-600">
                          {faltante.toFixed(2)} {producto.unidad}
                        </span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      ${(producto.cantidad * producto.precioUnitario).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reporte de faltantes */}
      {faltantes.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <FileText className="size-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-orange-900 mb-2">Reporte de Faltantes</h3>
              <p className="text-orange-700 mb-4">
                Se detectaron {faltantes.length} productos con stock bajo (menos de 10 unidades). 
                El valor estimado para reposición es de ${faltantesValor.toFixed(2)}.
              </p>
              <div className="bg-white rounded-lg p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-orange-200">
                      <th className="text-left py-2 text-orange-900">Producto</th>
                      <th className="text-left py-2 text-orange-900">Stock Actual</th>
                      <th className="text-left py-2 text-orange-900">A Reponer</th>
                      <th className="text-left py-2 text-orange-900">Costo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {faltantes.map(p => {
                      const aReponer = Math.max(0, 20 - p.cantidad);
                      return (
                        <tr key={p.id}>
                          <td className="py-2 text-orange-800">{p.nombre}</td>
                          <td className="py-2 text-orange-700">
                            {p.cantidad.toFixed(2)} {p.unidad}
                          </td>
                          <td className="py-2 text-orange-700">
                            {aReponer.toFixed(2)} {p.unidad}
                          </td>
                          <td className="py-2 text-orange-900">
                            ${(aReponer * p.precioUnitario).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="bg-orange-100 rounded-lg p-4 flex items-center justify-between">
            <span className="text-orange-900">Total a Invertir en Reposición:</span>
            <span className="text-orange-900">${faltantesValor.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
