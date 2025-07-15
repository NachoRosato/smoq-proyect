import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { backupApi, setTokenExpiredHandler } from '../../utils/api';
import Toast from '../../components/Toast';
import { Download, Trash2, RotateCcw, Database, HardDrive, Clock, FileText } from 'lucide-react';

interface Backup {
  fileName: string;
  size: string;
  createdAt: Date;
  modifiedAt: Date;
}

interface BackupStats {
  totalBackups: number;
  totalSize: string;
  oldestBackup: Date | null;
  newestBackup: Date | null;
}

interface BackupResponse {
  backups: Backup[];
  stats: BackupStats;
  method?: string;
}

const BackupPage: React.FC = () => {
  const { auth, handleTokenExpired } = useAuth();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState<string | null>(null);
  const [deletingBackup, setDeletingBackup] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [backupMethod, setBackupMethod] = useState<string>('');

  // Configurar el manejador de token expirado
  useEffect(() => {
    setTokenExpiredHandler(handleTokenExpired);
  }, [handleTokenExpired]);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await backupApi.getAll(auth.token!);
      if (response.success && response.data) {
        const backupData = response.data as BackupResponse;
        setBackups(backupData.backups);
        setStats(backupData.stats);
        setBackupMethod(backupData.method || '');
      }
    } catch (error) {
      console.error('Error cargando backups:', error);
      showToastMessage('Error al cargar backups', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createBackup = async () => {
    try {
      setCreatingBackup(true);
      const response = await backupApi.create(auth.token!);
      if (response.success) {
        showToastMessage('Backup creado exitosamente', 'success');
        loadBackups();
      }
    } catch (error) {
      console.error('Error creando backup:', error);
      showToastMessage('Error al crear backup', 'error');
    } finally {
      setCreatingBackup(false);
    }
  };

  const downloadBackup = async (fileName: string) => {
    try {
      backupApi.download(fileName, auth.token!);
      showToastMessage('Descarga iniciada', 'success');
    } catch (error) {
      console.error('Error descargando backup:', error);
      showToastMessage('Error al descargar backup', 'error');
    }
  };

  const restoreBackup = async (fileName: string) => {
    if (!confirm('¿Estás seguro de que quieres restaurar este backup? Esto sobrescribirá la base de datos actual.')) {
      return;
    }

    try {
      setRestoringBackup(fileName);
      const response = await backupApi.restore(fileName, auth.token!);
      if (response.success) {
        showToastMessage('Backup restaurado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error restaurando backup:', error);
      showToastMessage('Error al restaurar backup', 'error');
    } finally {
      setRestoringBackup(null);
    }
  };

  const deleteBackup = async (fileName: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este backup?')) {
      return;
    }

    try {
      setDeletingBackup(fileName);
      const response = await backupApi.delete(fileName, auth.token!);
      if (response.success) {
        showToastMessage('Backup eliminado exitosamente', 'success');
        loadBackups();
      }
    } catch (error) {
      console.error('Error eliminando backup:', error);
      showToastMessage('Error al eliminar backup', 'error');
    } finally {
      setDeletingBackup(null);
    }
  };

  const cleanOldBackups = async () => {
    if (!confirm('¿Estás seguro de que quieres limpiar backups antiguos? Se mantendrán solo los últimos 10.')) {
      return;
    }

    try {
      const response = await backupApi.clean(10, auth.token!);
      if (response.success) {
        showToastMessage('Limpieza completada', 'success');
        loadBackups();
      }
    } catch (error) {
      console.error('Error limpiando backups:', error);
      showToastMessage('Error al limpiar backups', 'error');
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-AR');
  };

  const formatFileSize = (size: string) => {
    const sizeInMB = parseFloat(size);
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(2)} KB`;
    }
    return `${sizeInMB} MB`;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Backups
          </h1>
          <p className="text-amber-700">
            Administra los backups de la base de datos
          </p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Backups</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBackups}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
              <div className="flex items-center">
                <HardDrive className="w-8 h-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tamaño Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSize} MB</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Backup Más Antiguo</p>
                  <p className="text-sm text-gray-900">
                    {stats.oldestBackup ? formatDate(stats.oldestBackup) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Backup Más Reciente</p>
                  <p className="text-sm text-gray-900">
                    {stats.newestBackup ? formatDate(stats.newestBackup) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Método de backup */}
        {backupMethod && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Método de backup:</span> {backupMethod}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                📦 Gestión de Backups
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={cleanOldBackups}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar Antiguos
                </button>
                <button
                  onClick={createBackup}
                  disabled={creatingBackup}
                  className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  {creatingBackup ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Crear Backup
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Lista de backups */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <span className="ml-3 text-gray-600">Cargando backups...</span>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay backups disponibles</p>
                <p className="text-sm text-gray-400 mt-2">Crea tu primer backup para empezar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.fileName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-amber-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">{backup.fileName}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(backup.createdAt)} • {formatFileSize(backup.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadBackup(backup.fileName)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
                        title="Descargar backup"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => restoreBackup(backup.fileName)}
                        disabled={restoringBackup === backup.fileName}
                        className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white p-2 rounded-lg transition-colors duration-200"
                        title="Restaurar backup"
                      >
                        {restoringBackup === backup.fileName ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteBackup(backup.fileName)}
                        disabled={deletingBackup === backup.fileName}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white p-2 rounded-lg transition-colors duration-200"
                        title="Eliminar backup"
                      >
                        {deletingBackup === backup.fileName ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </AdminLayout>
  );
};

export default BackupPage; 