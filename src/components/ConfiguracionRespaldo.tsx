import { useState } from 'react';
import { 
  crearRespaldo, 
  restaurarRespaldo, 
  descargarRespaldo, 
  cargarRespaldo,
  cargarDatos 
} from '../utils/storage';
import { 
  Save, 
  RotateCcw, 
  Download, 
  Upload,
  CheckCircle,
  AlertCircle,
  Database
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function ConfiguracionRespaldo() {
  const [procesando, setProcesando] = useState(false);
  const datos = cargarDatos();

  const handleCrearRespaldo = () => {
    setProcesando(true);
    try {
      crearRespaldo();
      toast.success('Respaldo creado exitosamente');
    } catch (error) {
      toast.error('Error al crear respaldo');
    } finally {
      setProcesando(false);
    }
  };

  const handleRestaurarRespaldo = () => {
    if (confirm('¿Estás seguro de que deseas restaurar el último respaldo? Esto sobrescribirá los datos actuales.')) {
      setProcesando(true);
      try {
        const exito = restaurarRespaldo();
        if (exito) {
          toast.success('Respaldo restaurado exitosamente');
          window.location.reload();
        } else {
          toast.error('No se encontró ningún respaldo');
        }
      } catch (error) {
        toast.error('Error al restaurar respaldo');
      } finally {
        setProcesando(false);
      }
    }
  };

  const handleDescargarRespaldo = () => {
    setProcesando(true);
    try {
      descargarRespaldo();
      toast.success('Respaldo descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar respaldo');
    } finally {
      setProcesando(false);
    }
  };

  const handleCargarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (confirm('¿Estás seguro de que deseas cargar este respaldo? Esto sobrescribirá los datos actuales.')) {
      setProcesando(true);
      try {
        const exito = await cargarRespaldo(archivo);
        if (exito) {
          toast.success('Respaldo cargado exitosamente');
          window.location.reload();
        } else {
          toast.error('Error al cargar el archivo de respaldo');
        }
      } catch (error) {
        toast.error('Error al procesar el archivo');
      } finally {
        setProcesando(false);
      }
    }
    
    // Limpiar input
    e.target.value = '';
  };

  const estadisticasDB = {
    productos: datos.almacenCentral.length,
    locales: datos.locales.length,
    movimientos: datos.movimientos.length,
    usuarios: datos.usuarios.length,
    mesas: Object.keys(datos.pedidosMesas).length
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Respaldo y Restauración</h1>
        <p className="text-gray-600">Administra los respaldos de la base de datos local</p>
      </div>

      {/* Información del último respaldo */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-100 p-3 rounded-lg">
            <Database className="size-8 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-gray-900 mb-2">Estado de la Base de Datos</h2>
            <p className="text-gray-600 mb-4">
              Último respaldo: {new Date(datos.ultimoRespaldo).toLocaleString('es-ES')}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-600">Productos</p>
                <p className="text-blue-900">{estadisticasDB.productos}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-green-600">Locales</p>
                <p className="text-green-900">{estadisticasDB.locales}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-purple-600">Movimientos</p>
                <p className="text-purple-900">{estadisticasDB.movimientos}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-orange-600">Usuarios</p>
                <p className="text-orange-900">{estadisticasDB.usuarios}</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="text-pink-600">Mesas</p>
                <p className="text-pink-900">{estadisticasDB.mesas}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones de respaldo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crear respaldo */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Save className="size-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Crear Respaldo</h3>
              <p className="text-gray-600">Guardar estado actual</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Crea un respaldo automático de todos los datos en el almacenamiento local del navegador.
          </p>
          <button
            onClick={handleCrearRespaldo}
            disabled={procesando}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:bg-gray-300"
          >
            <Save className="size-5" />
            Crear Respaldo
          </button>
        </div>

        {/* Restaurar respaldo */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <RotateCcw className="size-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Restaurar Respaldo</h3>
              <p className="text-gray-600">Recuperar último estado</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Restaura el último respaldo guardado. Esta acción sobrescribirá los datos actuales.
          </p>
          <button
            onClick={handleRestaurarRespaldo}
            disabled={procesando}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-gray-300"
          >
            <RotateCcw className="size-5" />
            Restaurar Respaldo
          </button>
        </div>

        {/* Descargar respaldo */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Download className="size-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Descargar Respaldo</h3>
              <p className="text-gray-600">Exportar a archivo</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Descarga un archivo JSON con todos los datos del sistema para almacenarlo externamente.
          </p>
          <button
            onClick={handleDescargarRespaldo}
            disabled={procesando}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:bg-gray-300"
          >
            <Download className="size-5" />
            Descargar Respaldo
          </button>
        </div>

        {/* Cargar respaldo */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Upload className="size-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Cargar Respaldo</h3>
              <p className="text-gray-600">Importar desde archivo</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Carga un archivo de respaldo previamente descargado. Sobrescribirá los datos actuales.
          </p>
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleCargarArchivo}
              disabled={procesando}
              className="hidden"
            />
            <div className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="size-5" />
              Cargar Respaldo
            </div>
          </label>
        </div>
      </div>

      {/* Información de seguridad */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <CheckCircle className="size-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-blue-900 mb-2">Sistema de Base de Datos Local</h3>
            <p className="text-blue-700 mb-4">
              Este sistema utiliza almacenamiento local del navegador (localStorage) para guardar todos los datos. 
              No requiere conexión a internet ni servidores externos.
            </p>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="size-5 flex-shrink-0 mt-0.5" />
                <span>Los datos se guardan automáticamente en cada operación</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="size-5 flex-shrink-0 mt-0.5" />
                <span>Sistema de respaldo automático cada vez que se modifican datos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="size-5 flex-shrink-0 mt-0.5" />
                <span>Posibilidad de exportar e importar datos manualmente</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Advertencia */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="size-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-yellow-900 mb-2">Importante</h3>
            <p className="text-yellow-700">
              Se recomienda descargar respaldos periódicamente a tu computadora. Los datos en localStorage 
              pueden perderse si se borran los datos del navegador o se reinstala el sistema operativo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
