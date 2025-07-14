# Sistema de Integridad Referencial - SMOQ

## 📋 Descripción

Este sistema mantiene la integridad referencial entre productos, categorías y gustos. Cuando se eliminan o modifican categorías o gustos, el sistema automáticamente actualiza los productos relacionados.

## 🔧 Funcionalidades

### 1. **Eliminación de Categorías**

- **Comportamiento**: Desactiva automáticamente todos los productos que usan la categoría eliminada
- **Campos agregados**:
  - `categoriaEliminada: true`
  - `fechaDesactivacion: Date`
- **Productos afectados**: Se marcan como inactivos pero no se eliminan

### 2. **Eliminación de Gustos**

- **Comportamiento**: Remueve el gusto de todos los productos que lo usan
- **Campos afectados**:
  - `gustos[]`: Se remueve el gusto del array
  - `stockPorGusto[]`: Se remueve el stock asociado al gusto
- **Productos afectados**: Mantienen su estado activo

### 3. **Modificación de Categorías/Gustos**

- **Comportamiento**: Verifica que los productos sigan funcionando correctamente
- **No hay cambios**: Los productos mantienen sus referencias

### 4. **Limpieza de Referencias Huérfanas**

- **Función**: `cleanupOrphanReferences()`
- **Propósito**: Encuentra y corrige referencias a categorías/gustos que ya no existen
- **Ejecución**: Manual o automática

## 🛠️ Archivos Principales

### Backend

- `backend/utils/referentialIntegrity.js` - Funciones principales
- `backend/routes/config.js` - Rutas actualizadas con integridad referencial
- `backend/models/Producto.js` - Modelo actualizado con campos adicionales
- `backend/cleanup-orphans.js` - Script independiente para limpieza

### Frontend

- `frontend/pages/admin/dashboard.tsx` - Dashboard actualizado con indicadores
- `frontend/lib/helpers.ts` - Funciones helper para manejo seguro de datos

## 📊 API Endpoints

### Categorías

```javascript
// Editar categoría
PUT /api/config/categorias/:id
// Respuesta incluye: { categoria, productosActualizados }

// Eliminar categoría
DELETE /api/config/categorias/:id
// Respuesta incluye: { mensaje, productosActualizados }
```

### Gustos

```javascript
// Editar gusto
PUT /api/config/gustos/:id
// Respuesta incluye: { gusto, productosActualizados }

// Eliminar gusto
DELETE /api/config/gustos/:id
// Respuesta incluye: { mensaje, productosActualizados }
```

### Limpieza

```javascript
// Limpiar referencias huérfanas
POST / api / config / cleanup;
// Respuesta incluye: { success, message, result }
```

## 🚀 Uso

### 1. **Ejecutar Limpieza Manual**

```bash
cd backend
node cleanup-orphans.js
```

### 2. **Ver Productos Desactivados**

- Ir al dashboard administrativo
- Ver el contador "Productos Desactivados"
- Los productos desactivados muestran badge "Categoría Eliminada"

### 3. **Reactivar Productos**

- Los productos desactivados pueden ser reactivados manualmente
- Se debe asignar una nueva categoría válida

## 🔍 Logs del Sistema

El sistema genera logs detallados:

```
🔄 Actualizando productos después de eliminar categoría: 507f1f77bcf86cd799439011
✅ 5 productos desactivados por eliminación de categoría

🔄 Actualizando productos después de eliminar gusto: 507f1f77bcf86cd799439012
✅ 3 productos actualizados por eliminación de gusto

🧹 Iniciando limpieza de referencias huérfanas...
✅ 2 productos desactivados por categorías huérfanas
✅ 1 productos limpiados de gustos huérfanos
```

## ⚠️ Consideraciones

### Ventajas

- ✅ Mantiene integridad de datos
- ✅ Previene errores en el frontend
- ✅ Proceso automático y transparente
- ✅ Logs detallados para debugging

### Limitaciones

- ⚠️ Los productos desactivados requieren intervención manual
- ⚠️ No hay rollback automático de eliminaciones
- ⚠️ La limpieza puede tomar tiempo en bases de datos grandes

## 🔄 Flujo de Trabajo Recomendado

1. **Antes de eliminar una categoría**:

   - Verificar cuántos productos la usan
   - Considerar migrar productos a otra categoría

2. **Después de eliminar**:

   - Revisar productos desactivados en el dashboard
   - Reactivar y reasignar categoría si es necesario

3. **Mantenimiento regular**:
   - Ejecutar limpieza de referencias huérfanas
   - Revisar logs del sistema

## 🐛 Troubleshooting

### Error: "Cannot read properties of null"

- **Causa**: Datos inconsistentes en la base de datos
- **Solución**: Ejecutar `cleanup-orphans.js`

### Productos no aparecen

- **Causa**: Productos desactivados por eliminación de categoría
- **Solución**: Reactivar y reasignar categoría

### Gustos no se muestran

- **Causa**: Referencias huérfanas
- **Solución**: Ejecutar limpieza y recrear gustos
