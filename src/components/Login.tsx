import { useState } from 'react';
import { autenticarUsuario, guardarUsuarioActual } from '../utils/storage';
import { LogIn, Shield } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [nombre, setNombre] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const usuario = autenticarUsuario(nombre, contraseña);
    if (usuario) {
      guardarUsuarioActual(usuario);
      onLogin();
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-4 rounded-full mb-4">
            <Shield className="size-12 text-white" />
          </div>
          <h1 className="text-gray-900 text-center mb-2">Sistema CRM</h1>
          <p className="text-gray-600 text-center">Gestión de Locales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-gray-700 mb-2">
              Usuario
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div>
            <label htmlFor="contraseña" className="block text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="contraseña"
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <LogIn className="size-5" />
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-center">
            <strong>Usuario predeterminado:</strong> Gerente
          </p>
          <p className="text-gray-500 text-center">
            <strong>Contraseña:</strong> admin123
          </p>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-center">
            <Shield className="size-4 inline mr-1" />
            Sistema de seguridad máxima activado
          </p>
        </div>
      </div>
    </div>
  );
}
