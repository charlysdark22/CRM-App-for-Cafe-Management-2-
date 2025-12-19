import { useState, useEffect } from 'react';
import { cargarDatos, guardarDatos, AppData, Movimiento } from '../utils/storage';
import { 
  UtensilsCrossed, 
  Plus, 
  Minus, 
  CheckCircle, 
  XCircle,
  ShoppingCart,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function MesasPedidos() {
  const [datos, setDatos] = useState<AppData | null>(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<'todas' | 'cocina' | 'cantina'>('todas');

  useEffect(() => {
    setDatos(cargarDatos());
  }, []);

  const actualizarDatos = () => {
    setDatos(cargarDatos());
  };

  const agregarProductoMesa = (productoId: string, nombreProducto: string) => {
    if (!datos || mesaSeleccionada === null) return;

    const local = datos.locales.find(l => l.id === 'local-001');
    if (!local) return;

    const producto = local.almacen.find(p => p.id === productoId);
    if (!producto) {
      toast.error('Producto no disponible en el almacén del local');
      return;
    }

    if (producto.cantidad < 1) {
      toast.error(`Stock insuficiente de ${nombreProducto}`);
      return;
    }

    const pedido = datos.pedidosMesas[mesaSeleccionada];
    const itemExistente = pedido.items.find(i => i.productoId === productoId);

    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      pedido.items.push({
        productoId,
        cantidad: 1,
        nombre: nombreProducto
      });
    }

    pedido.activa = true;
    guardarDatos(datos);
    actualizarDatos();
    toast.success(`${nombreProducto} agregado a la mesa ${mesaSeleccionada}`);
  };

  const quitarProductoMesa = (productoId: string) => {
    if (!datos || mesaSeleccionada === null) return;

    const pedido = datos.pedidosMesas[mesaSeleccionada];
    const item = pedido.items.find(i => i.productoId === productoId);

    if (item) {
      if (item.cantidad > 1) {
        item.cantidad -= 1;
      } else {
        pedido.items = pedido.items.filter(i => i.productoId !== productoId);
      }

      if (pedido.items.length === 0) {
        pedido.activa = false;
      }

      guardarDatos(datos);
      actualizarDatos();
    }
  };

  const eliminarProductoMesa = (productoId: string) => {
    if (!datos || mesaSeleccionada === null) return;

    const pedido = datos.pedidosMesas[mesaSeleccionada];
    pedido.items = pedido.items.filter(i => i.productoId !== productoId);

    if (pedido.items.length === 0) {
      pedido.activa = false;
    }

    guardarDatos(datos);
    actualizarDatos();
  };

  const finalizarPedido = () => {
    if (!datos || mesaSeleccionada === null) return;

    const pedido = datos.pedidosMesas[mesaSeleccionada];
    const local = datos.locales.find(l => l.id === 'local-001');
    if (!local) return;

    let errores = 0;
    const movimientos: Movimiento[] = [];

    pedido.items.forEach(item => {
      const producto = local.almacen.find(p => p.id === item.productoId);
      if (!producto) return;

      if (producto.cantidad < item.cantidad) {
        toast.error(`Stock insuficiente de ${item.nombre}`);
        errores++;
        return;
      }

      // Descontar del inventario
      producto.cantidad -= item.cantidad;
      producto.fechaActualizacion = new Date().toISOString();

      // Registrar movimiento
      movimientos.push({
        id: `m${Date.now()}-${item.productoId}`,
        tipo: 'consumo',
        productoId: item.productoId,
        cantidad: item.cantidad,
        destino: 'local-001',
        fecha: new Date().toISOString(),
        mesa: mesaSeleccionada
      });
    });

    if (errores === 0) {
      datos.movimientos.push(...movimientos);
      
      // Limpiar pedido
      pedido.items = [];
      pedido.total = 0;
      pedido.activa = false;

      guardarDatos(datos);
      toast.success(`Pedido de mesa ${mesaSeleccionada} finalizado correctamente`);
      actualizarDatos();
    }
  };

  const cancelarPedido = () => {
    if (!datos || mesaSeleccionada === null) return;

    const pedido = datos.pedidosMesas[mesaSeleccionada];
    pedido.items = [];
    pedido.total = 0;
    pedido.activa = false;

    guardarDatos(datos);
    toast.info(`Pedido de mesa ${mesaSeleccionada} cancelado`);
    actualizarDatos();
  };

  if (!datos) return null;

  const local = datos.locales.find(l => l.id === 'local-001');
  if (!local) return null;

  const productosFiltrados = local.almacen.filter(p =>
    categoriaFiltro === 'todas' || p.categoria === categoriaFiltro
  );

  const pedidoActual = mesaSeleccionada !== null ? datos.pedidosMesas[mesaSeleccionada] : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Mesas y Pedidos</h1>
        <p className="text-gray-600">Gestión de consumos por mesa - Cafe Avellaneda</p>
      </div>

      {/* Selector de mesas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(numeroMesa => {
          const pedido = datos.pedidosMesas[numeroMesa];
          const activa = pedido.activa;
          const totalItems = pedido.items.reduce((sum, i) => sum + i.cantidad, 0);

          return (
            <button
              key={numeroMesa}
              onClick={() => setMesaSeleccionada(numeroMesa)}
              className={`relative p-6 rounded-xl shadow-lg border-2 transition ${
                mesaSeleccionada === numeroMesa
                  ? 'border-indigo-500 bg-indigo-50'
                  : activa
                  ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`p-4 rounded-full mb-3 ${
                  activa ? 'bg-orange-500' : 'bg-gray-300'
                }`}>
                  <UtensilsCrossed className="size-8 text-white" />
                </div>
                <h3 className="text-gray-900 mb-1">Mesa {numeroMesa}</h3>
                {activa ? (
                  <span className="text-orange-600">{totalItems} items</span>
                ) : (
                  <span className="text-gray-500">Disponible</span>
                )}
              </div>
              
              {activa && (
                <div className="absolute top-2 right-2">
                  <div className="bg-orange-500 rounded-full size-3 animate-pulse"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {mesaSeleccionada !== null ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menú de productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-gray-900 mb-4">Menú de Productos</h2>

              {/* Filtro de categorías */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setCategoriaFiltro('todas')}
                  className={`px-4 py-2 rounded-lg transition ${
                    categoriaFiltro === 'todas'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setCategoriaFiltro('cocina')}
                  className={`px-4 py-2 rounded-lg transition ${
                    categoriaFiltro === 'cocina'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cocina
                </button>
                <button
                  onClick={() => setCategoriaFiltro('cantina')}
                  className={`px-4 py-2 rounded-lg transition ${
                    categoriaFiltro === 'cantina'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cantina
                </button>
              </div>

              {/* Lista de productos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map(producto => (
                    <button
                      key={producto.id}
                      onClick={() => agregarProductoMesa(producto.id, producto.nombre)}
                      disabled={producto.cantidad < 1}
                      className={`p-4 rounded-lg border-2 text-left transition ${
                        producto.cantidad < 1
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-2 rounded-lg ${
                          producto.categoria === 'cocina' ? 'bg-orange-100' : 'bg-blue-100'
                        }`}>
                          <ShoppingCart className={`size-5 ${
                            producto.categoria === 'cocina' ? 'text-orange-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <span className={`px-2 py-1 rounded text-sm ${
                          producto.cantidad < 10
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {producto.cantidad.toFixed(0)} {producto.unidad}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-1">{producto.nombre}</p>
                      <p className="text-gray-600">${producto.precioUnitario.toFixed(2)}</p>
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No hay productos disponibles
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pedido actual */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-6">
              <h2 className="text-gray-900 mb-4">Mesa {mesaSeleccionada}</h2>

              {pedidoActual && pedidoActual.items.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                    {pedidoActual.items.map(item => {
                      const producto = local.almacen.find(p => p.id === item.productoId);
                      const valorTotal = producto ? producto.precioUnitario * item.cantidad : 0;

                      return (
                        <div key={item.productoId} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-gray-900">{item.nombre}</p>
                              <p className="text-gray-600">
                                ${producto?.precioUnitario.toFixed(2)} × {item.cantidad}
                              </p>
                            </div>
                            <button
                              onClick={() => eliminarProductoMesa(item.productoId)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => quitarProductoMesa(item.productoId)}
                                className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
                              >
                                <Minus className="size-4" />
                              </button>
                              <span className="text-gray-900 min-w-[2rem] text-center">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => agregarProductoMesa(item.productoId, item.nombre)}
                                className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
                              >
                                <Plus className="size-4" />
                              </button>
                            </div>
                            <span className="text-gray-900">${valorTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Total items:</span>
                      <span className="text-gray-900">
                        {pedidoActual.items.reduce((sum, i) => sum + i.cantidad, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">
                        $
                        {pedidoActual.items
                          .reduce((sum, item) => {
                            const producto = local.almacen.find(p => p.id === item.productoId);
                            return sum + (producto ? producto.precioUnitario * item.cantidad : 0);
                          }, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={finalizarPedido}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="size-5" />
                      Finalizar Pedido
                    </button>
                    <button
                      onClick={cancelarPedido}
                      className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <XCircle className="size-5" />
                      Cancelar Pedido
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <UtensilsCrossed className="size-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Mesa vacía</p>
                  <p className="text-gray-500">Selecciona productos del menú para comenzar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
          <UtensilsCrossed className="size-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-gray-900 mb-2">Selecciona una mesa</h2>
          <p className="text-gray-600">Elige una de las 4 mesas disponibles para comenzar a gestionar pedidos</p>
        </div>
      )}
    </div>
  );
}
