// Sistema de almacenamiento local con respaldo de datos
export interface Usuario {
  id: string;
  nombre: string;
  rol: 'superadmin' | 'admin' | 'empleado';
  contraseña: string;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: 'cocina' | 'cantina';
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  fechaActualizacion: string;
}

export interface Movimiento {
  id: string;
  tipo: 'entrada' | 'salida' | 'consumo' | 'suministro';
  productoId: string;
  cantidad: number;
  origen?: string;
  destino?: string;
  fecha: string;
  mesa?: number;
}

export interface Local {
  id: string;
  nombre: string;
  activo: boolean;
  almacen: Producto[];
}

export interface AppData {
  usuarios: Usuario[];
  almacenCentral: Producto[];
  locales: Local[];
  movimientos: Movimiento[];
  pedidosMesas: { [mesaId: number]: PedidoMesa };
  ultimoRespaldo: string;
}

export interface PedidoMesa {
  items: { productoId: string; cantidad: number; nombre: string }[];
  total: number;
  activa: boolean;
}

// Datos iniciales del sistema
const datosIniciales: AppData = {
  usuarios: [
    {
      id: 'gerente-001',
      nombre: 'Gerente',
      rol: 'superadmin',
      contraseña: 'admin123' // En producción, esto debe estar hasheado
    }
  ],
  almacenCentral: [
    // Productos de Cocina
    { id: 'p001', nombre: 'Harina', categoria: 'cocina', cantidad: 100, unidad: 'kg', precioUnitario: 2.5, fechaActualizacion: new Date().toISOString() },
    { id: 'p002', nombre: 'Azúcar', categoria: 'cocina', cantidad: 80, unidad: 'kg', precioUnitario: 3.0, fechaActualizacion: new Date().toISOString() },
    { id: 'p003', nombre: 'Sal', categoria: 'cocina', cantidad: 50, unidad: 'kg', precioUnitario: 1.5, fechaActualizacion: new Date().toISOString() },
    { id: 'p004', nombre: 'Aceite', categoria: 'cocina', cantidad: 60, unidad: 'litros', precioUnitario: 4.5, fechaActualizacion: new Date().toISOString() },
    { id: 'p005', nombre: 'Arroz', categoria: 'cocina', cantidad: 90, unidad: 'kg', precioUnitario: 2.8, fechaActualizacion: new Date().toISOString() },
    { id: 'p006', nombre: 'Pasta', categoria: 'cocina', cantidad: 70, unidad: 'kg', precioUnitario: 2.2, fechaActualizacion: new Date().toISOString() },
    { id: 'p007', nombre: 'Tomate', categoria: 'cocina', cantidad: 40, unidad: 'kg', precioUnitario: 3.5, fechaActualizacion: new Date().toISOString() },
    { id: 'p008', nombre: 'Cebolla', categoria: 'cocina', cantidad: 35, unidad: 'kg', precioUnitario: 2.0, fechaActualizacion: new Date().toISOString() },
    // Productos de Cantina
    { id: 'p009', nombre: 'Café', categoria: 'cantina', cantidad: 120, unidad: 'kg', precioUnitario: 8.5, fechaActualizacion: new Date().toISOString() },
    { id: 'p010', nombre: 'Leche', categoria: 'cantina', cantidad: 150, unidad: 'litros', precioUnitario: 1.8, fechaActualizacion: new Date().toISOString() },
    { id: 'p011', nombre: 'Té', categoria: 'cantina', cantidad: 40, unidad: 'kg', precioUnitario: 6.0, fechaActualizacion: new Date().toISOString() },
    { id: 'p012', nombre: 'Chocolate', categoria: 'cantina', cantidad: 30, unidad: 'kg', precioUnitario: 12.0, fechaActualizacion: new Date().toISOString() },
    { id: 'p013', nombre: 'Jugos', categoria: 'cantina', cantidad: 200, unidad: 'litros', precioUnitario: 3.5, fechaActualizacion: new Date().toISOString() },
    { id: 'p014', nombre: 'Galletas', categoria: 'cantina', cantidad: 100, unidad: 'paquetes', precioUnitario: 2.5, fechaActualizacion: new Date().toISOString() },
    { id: 'p015', nombre: 'Pan', categoria: 'cantina', cantidad: 80, unidad: 'unidades', precioUnitario: 0.5, fechaActualizacion: new Date().toISOString() },
  ],
  locales: [
    {
      id: 'local-001',
      nombre: 'Cafe Avellaneda',
      activo: true,
      almacen: []
    },
    {
      id: 'local-002',
      nombre: 'Local 2',
      activo: false,
      almacen: []
    },
    {
      id: 'local-003',
      nombre: 'Local 3',
      activo: false,
      almacen: []
    },
    {
      id: 'local-004',
      nombre: 'Local 4',
      activo: false,
      almacen: []
    }
  ],
  movimientos: [],
  pedidosMesas: {
    1: { items: [], total: 0, activa: false },
    2: { items: [], total: 0, activa: false },
    3: { items: [], total: 0, activa: false },
    4: { items: [], total: 0, activa: false }
  },
  ultimoRespaldo: new Date().toISOString()
};

// Funciones de almacenamiento
export const cargarDatos = (): AppData => {
  try {
    const datosGuardados = localStorage.getItem('crm-locales-data');
    if (datosGuardados) {
      return JSON.parse(datosGuardados);
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
  
  // Si no hay datos, inicializar con datos por defecto
  guardarDatos(datosIniciales);
  return datosIniciales;
};

export const guardarDatos = (datos: AppData): void => {
  try {
    localStorage.setItem('crm-locales-data', JSON.stringify(datos));
  } catch (error) {
    console.error('Error al guardar datos:', error);
  }
};

export const crearRespaldo = (): string => {
  const datos = cargarDatos();
  datos.ultimoRespaldo = new Date().toISOString();
  const respaldo = JSON.stringify(datos);
  
  // Guardar respaldo en localStorage separado
  localStorage.setItem('crm-locales-respaldo', respaldo);
  guardarDatos(datos);
  
  return respaldo;
};

export const restaurarRespaldo = (): boolean => {
  try {
    const respaldo = localStorage.getItem('crm-locales-respaldo');
    if (respaldo) {
      const datos = JSON.parse(respaldo);
      guardarDatos(datos);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al restaurar respaldo:', error);
    return false;
  }
};

export const descargarRespaldo = (): void => {
  const respaldo = crearRespaldo();
  const blob = new Blob([respaldo], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `respaldo-crm-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const cargarRespaldo = (archivo: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const datos = JSON.parse(e.target?.result as string);
        guardarDatos(datos);
        resolve(true);
      } catch (error) {
        console.error('Error al cargar archivo de respaldo:', error);
        resolve(false);
      }
    };
    reader.readAsText(archivo);
  });
};

// Funciones de autenticación
export const autenticarUsuario = (nombre: string, contraseña: string): Usuario | null => {
  const datos = cargarDatos();
  const usuario = datos.usuarios.find(u => u.nombre === nombre && u.contraseña === contraseña);
  return usuario || null;
};

export const obtenerUsuarioActual = (): Usuario | null => {
  try {
    const usuarioGuardado = sessionStorage.getItem('usuario-actual');
    if (usuarioGuardado) {
      return JSON.parse(usuarioGuardado);
    }
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
  }
  return null;
};

export const guardarUsuarioActual = (usuario: Usuario): void => {
  sessionStorage.setItem('usuario-actual', JSON.stringify(usuario));
};

export const cerrarSesion = (): void => {
  sessionStorage.removeItem('usuario-actual');
};
