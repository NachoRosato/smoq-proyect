import React from 'react';
import { AlertTriangle, LogOut, ArrowLeft } from 'lucide-react';

interface TokenExpiredModalProps {
  isOpen: boolean;
  onLogout: () => void;
  onGoBack: () => void;
}

const TokenExpiredModal: React.FC<TokenExpiredModalProps> = ({
  isOpen,
  onLogout,
  onGoBack
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-amber-900">
                Sesión Expirada
              </h3>
              <p className="text-sm text-amber-700">
                Su token de administrador ha expirado
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="text-center">
            <p className="text-gray-700 mb-6">
              Su sesión de administrador ha expirado por seguridad. 
              Necesita iniciar sesión nuevamente para continuar.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                <span className="text-sm text-amber-800 font-medium">
                  Por su seguridad, todas las sesiones expiran automáticamente
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={onGoBack}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <button
              onClick={onLogout}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenExpiredModal; 