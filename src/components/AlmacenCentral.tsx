import { useState, useEffect } from 'react';
import { cargarDatos, guardarDatos, AppData, Producto, Movimiento } from '../utils/storage';
import { 
  Package, 
  Plus, 
  TrendingUp, 
  ArrowUpCircle, 
  Search,
  Edit,
  Save,
  X
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AlmacenCentral() {
  const [datos, setDatos] = useState<AppData | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<'todas' | 'cocina' | 'cantina'>('todas');
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState<Producto | null>(null);
  const [modalEntrada, setModalEntrada] = useState<Producto | null>(null);
  
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    categoria: 'cocina' as 'cocina' | 'cantina',
    cantidad: 0,
    unidad: '',
    precioUnitario: 0
  });

  const [cantidadEntrada, setCantidadEntrada] = useState(0);

  useEffect(() => {
    setDatos(cargarDatos());
  }, []);

  const actualizarDatos = () => {
    setDatos(cargarDatos());
  };

  const agregarProducto = () => {
    if (!datos) return;
    
    const producto: Producto = {
      id: `p${Date.now()}`,
      nombre: nuevoProducto.nombre,
      categoria: nuevoProducto.categoria,
      cantidad: nuevoProducto.cantidad,
      unidad: nuevoProducto.unidad,
      precioUnitario: nuevoProducto.precioUnitario,
      fechaActualizacion: new Date().toISOString()
    };

    const movimiento: Movimiento = {
      id: `m${Date.now()}`,
      tipo: 'entrada',
      productoId: producto.id,
      cantidad: producto.cantidad,
      destino: 'almacen-central',
      fecha: new Date().toISOString()
    };

    datos.almacenCentral.push(producto);
    datos.movimientos.push(movimiento);
    guardarDatos(datos);
    
    setNuevoProducto({
      nombre: '',
      categoria: 'cocina',
      cantidad: 0,
      unidad: '',
      precioUnitario: 0
    });
    setModalAgregar(false);
    actualizarDatos();
  };

  const editarProducto = () => {
    if (!datos || !modalEditar) return;

    const index = datos.almacenCentral.findIndex(p => p.id === modalEditar.id);
    if (index !== -1) {
      datos.almacenCentral[index] = {
        ...modalEditar,
        fechaActualizacion: new Date().toISOString()
      };
      guardarDatos(datos);
      setModalEditar(null);
      actualizarDatos();
    }
  };

  const registrarEntrada = () => {
    if (!datos || !modalEntrada || cantidadEntrada <= 0) return;

    const index = datos.almacenCentral.findIndex(p => p.id === modalEntrada.id);
    if (index !== -1) {
      datos.almacenCentral[index].cantidad += cantidadEntrada;
      datos.almacenCentral[index].fechaActualizacion = new Date().toISOString();

      const movimiento: Movimiento = {
        id: `m${Date.now()}`,
        tipo: 'entrada',
        productoId: modalEntrada.id,
        cantidad: cantidadEntrada,
        destino: 'almacen-central',
        fecha: new Date().toISOString()
      };
      datos.movimientos.push(movimiento);

      guardarDatos(datos);
      setModalEntrada(null);
      setCantidadEntrada(0);
      actualizarDatos();
    }
  };

  if (!datos) return null;

  const productosFiltrados = datos.almacenCentral.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === 'todas' || p.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  // Datos para gráficos
  const datosGraficoBarra = [
    {
      nombre: 'Cocina',
      productos: datos.almacenCentral.filter(p => p.categoria === 'cocina').length,
      unidades: datos.almacenCentral.filter(p => p.categoria === 'cocina').reduce((sum, p) => sum + p.cantidad, 0)
    },
    {
      nombre: 'Cantina',
      productos: datos.almacenCentral.filter(p => p.categoria === 'cantina').length,
      unidades: datos.almacenCentral.filter(p => p.categoria === 'cantina').reduce((sum, p) => sum + p.cantidad, 0)
    }
  ];

  const datosGraficoPastel = datos.almacenCentral.map(p => ({
    nombre: p.nombre,
    valor: p.cantidad * p.precioUnitario
  })).sort((a, b) => b.valor - a.valor).slice(0, 8);

  const COLORES = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Almacén Central</h1>
          <p className="text-gray-600">Gestión de inventario principal</p>
        </div>
        <button
          onClick={() => setModalAgregar(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <Plus className="size-5" />
          Agregar Producto
        </button>
      </div>

      {/* Gráficos estadísticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-gray-900 mb-4">Distribución por Categoría</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosGraficoBarra}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="productos" fill="#4F46E5" name="Productos" />
              <Bar dataKey="unidades" fill="#06B6D4" name="Unidades" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-gray-900 mb-4">Valor por Producto (Top 8)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosGraficoPastel}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valor"
              >
                {datosGraficoPastel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div className="flex gap-2">
            <button
              onClick={() => setCategoriaFiltro('todas')}
              className={`flex-1 px-4 py-3 rounded-lg transition ${
                categoriaFiltro === 'todas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setCategoriaFiltro('cocina')}
              className={`flex-1 px-4 py-3 rounded-lg transition ${
                categoriaFiltro === 'cocina'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cocina
            </button>
            <button
              onClick={() => setCategoriaFiltro('cantina')}
              className={`flex-1 px-4 py-3 rounded-lg transition ${
                categoriaFiltro === 'cantina'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cantina
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Producto</th>
                <th className="px-6 py-4 text-left text-gray-700">Categoría</th>
                <th className="px-6 py-4 text-left text-gray-700">Cantidad</th>
                <th className="px-6 py-4 text-left text-gray-700">Unidad</th>
                <th className="px-6 py-4 text-left text-gray-700">Precio Unit.</th>
                <th className="px-6 py-4 text-left text-gray-700">Valor Total</th>
                <th className="px-6 py-4 text-left text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productosFiltrados.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${producto.categoria === 'cocina' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                        <Package className={`size-5 ${producto.categoria === 'cocina' ? 'text-orange-600' : 'text-blue-600'}`} />
                      </div>
                      <span className="text-gray-900">{producto.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full ${
                      producto.categoria === 'cocina'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`${producto.cantidad < 20 ? 'text-orange-600' : 'text-gray-900'}`}>
                      {producto.cantidad.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{producto.unidad}</td>
                  <td className="px-6 py-4 text-gray-900">${producto.precioUnitario.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-900">${(producto.cantidad * producto.precioUnitario).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModalEntrada(producto)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                        title="Registrar entrada"
                      >
                        <ArrowUpCircle className="size-5" />
                      </button>
                      <button
                        onClick={() => setModalEditar(producto)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        title="Editar"
                      >
                        <Edit className="size-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar Producto */}
      {modalAgregar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Agregar Producto</h2>
              <button onClick={() => setModalAgregar(false)} className="text-gray-500 hover:text-gray-700">
                <X className="size-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={nuevoProducto.nombre}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Categoría</label>
                <select
                  value={nuevoProducto.categoria}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value as 'cocina' | 'cantina'})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="cocina">Cocina</option>
                  <option value="cantina">Cantina</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Cantidad</label>
                  <input
                    type="number"
                    value={nuevoProducto.cantidad}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, cantidad: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Unidad</label>
                  <input
                    type="text"
                    value={nuevoProducto.unidad}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, unidad: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="kg, litros..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Precio Unitario</label>
                <input
                  type="number"
                  value={nuevoProducto.precioUnitario}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, precioUnitario: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  min="0"
                  step="0.01"
                />
              </div>

              <button
                onClick={agregarProducto}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Save className="size-5" />
                Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Producto */}
      {modalEditar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Editar Producto</h2>
              <button onClick={() => setModalEditar(null)} className="text-gray-500 hover:text-gray-700">
                <X className="size-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={modalEditar.nombre}
                  onChange={(e) => setModalEditar({...modalEditar, nombre: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Precio Unitario</label>
                <input
                  type="number"
                  value={modalEditar.precioUnitario}
                  onChange={(e) => setModalEditar({...modalEditar, precioUnitario: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  min="0"
                  step="0.01"
                />
              </div>

              <button
                onClick={editarProducto}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Save className="size-5" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Entrada */}
      {modalEntrada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Registrar Entrada</h2>
              <button onClick={() => { setModalEntrada(null); setCantidadEntrada(0); }} className="text-gray-500 hover:text-gray-700">
                <X className="size-6" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 mb-1">Producto: <strong>{modalEntrada.nombre}</strong></p>
              <p className="text-gray-700">Stock actual: <strong>{modalEntrada.cantidad} {modalEntrada.unidad}</strong></p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Cantidad a agregar</label>
                <input
                  type="number"
                  value={cantidadEntrada}
                  onChange={(e) => setCantidadEntrada(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  min="0"
                  step="0.01"
                />
              </div>

              {cantidadEntrada > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-700">
                    Nuevo stock: <strong>{(modalEntrada.cantidad + cantidadEntrada).toFixed(2)} {modalEntrada.unidad}</strong>
                  </p>
                </div>
              )}

              <button
                onClick={registrarEntrada}
                disabled={cantidadEntrada <= 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ArrowUpCircle className="size-5" />
                Registrar Entrada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
