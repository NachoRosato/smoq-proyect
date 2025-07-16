# Verificación de Edad - SMOQ Tienda

## Descripción

Se ha implementado un sistema de verificación de edad profesional que aparece automáticamente cuando un usuario visita el sitio por primera vez. Este modal verifica que el usuario sea mayor de 18 años antes de permitir el acceso al contenido.

## Características

### 🎨 Diseño Profesional

- **Paleta de colores**: Mantiene la identidad visual del sitio (negro y dorado/ámbar)
- **Animaciones suaves**: Transiciones elegantes y efectos visuales profesionales
- **Responsive**: Se adapta perfectamente a todos los dispositivos
- **Accesibilidad**: Cumple con estándares de accesibilidad web

### 🔒 Funcionalidad

- **Verificación obligatoria**: Aparece automáticamente en la primera visita
- **Persistencia**: Una vez aceptado, no vuelve a aparecer (almacenado en localStorage)
- **Redirección inteligente**: Si el usuario declara ser menor de edad, es redirigido a Google.com
- **Exclusión de admin**: No aparece en páginas del panel de administración

### 🛠️ Componentes Implementados

#### 1. `AgeVerificationModal.tsx`

Modal principal con diseño elegante que incluye:

- Icono de escudo protector
- Mensaje claro sobre la verificación de edad
- Botones de acción claros y diferenciados
- Elementos decorativos animados
- Prevención de scroll del body

#### 2. `AgeVerificationContext.tsx`

Contexto React que maneja:

- Estado de verificación de edad
- Persistencia en localStorage
- Funciones de verificación y rechazo
- Función de reset para testing

#### 3. `AgeVerificationWrapper.tsx`

Componente wrapper que:

- Controla cuándo mostrar el modal
- Excluye páginas de administración
- Maneja la lógica de renderizado condicional

#### 4. `ResetAgeVerification.tsx`

Componente de administración que permite:

- Resetear la verificación de edad
- Testing de la funcionalidad
- Control desde el panel de admin

## Instalación y Configuración

### 1. Archivos Creados

```
frontend/components/AgeVerificationModal.tsx
frontend/components/AgeVerificationWrapper.tsx
frontend/components/ResetAgeVerification.tsx
frontend/context/AgeVerificationContext.tsx
```

### 2. Archivos Modificados

```
frontend/pages/_app.tsx - Agregado provider y wrapper
frontend/pages/admin/dashboard.tsx - Agregado botón de reset
frontend/styles/globals.css - Agregadas animaciones
```

### 3. Integración Automática

El sistema se integra automáticamente en la aplicación:

- Se muestra en todas las páginas públicas
- No interfiere con el panel de administración
- Persiste la verificación entre sesiones

## Uso

### Para Usuarios

1. Al visitar el sitio por primera vez, aparece el modal
2. Seleccionar "Sí, soy mayor de 18 años" para continuar
3. Seleccionar "No, soy menor de edad" para ser redirigido a Google

### Para Administradores

1. Ir al panel de administración
2. En la sección "Configuración de Verificación de Edad"
3. Hacer clic en "Resetear Verificación de Edad"
4. El modal aparecerá en la próxima visita

## Personalización

### Cambiar Redirección

En `AgeVerificationContext.tsx`, línea 28:

```typescript
window.location.href = "https://www.google.com";
```

### Modificar Mensaje

En `AgeVerificationModal.tsx`, líneas 67-69:

```typescript
<p className="text-lg leading-relaxed">
  Este sitio web contiene productos destinados únicamente para personas mayores
  de 18 años.
</p>
```

### Cambiar Colores

Los colores se pueden modificar en las clases CSS del modal:

- Fondo: `rgb(0 0 0)` a `rgb(21 21 21)` a `rgb(159, 129, 51)`
- Acentos: `rgb(147, 133, 90)` y `rgb(159, 129, 51)`

## Animaciones Agregadas

### CSS Global (`globals.css`)

- `modal-fade-in`: Entrada suave del modal
- `modal-fade-out`: Salida suave del modal
- `gentle-pulse`: Pulso suave para elementos decorativos

## Consideraciones Técnicas

### Seguridad

- La verificación es solo informativa
- No reemplaza verificaciones legales reales
- Cumple con estándares de protección al menor

### Rendimiento

- Carga asíncrona del modal
- Animaciones optimizadas con CSS
- No afecta el rendimiento general del sitio

### Compatibilidad

- Funciona en todos los navegadores modernos
- Responsive design para móviles
- Accesible para lectores de pantalla

## Testing

### Probar la Funcionalidad

1. Abrir las herramientas de desarrollador (F12)
2. Ir a Application > Local Storage
3. Eliminar la clave `ageVerification`
4. Recargar la página
5. El modal debería aparecer

### Resetear desde Admin

1. Ir a `/admin/dashboard`
2. Buscar la sección "Configuración de Verificación de Edad"
3. Hacer clic en "Resetear Verificación de Edad"
4. Recargar la página principal
5. El modal debería aparecer

## Mantenimiento

### Actualizaciones Futuras

- El código está modularizado para fácil mantenimiento
- Los estilos están centralizados en el CSS global
- La lógica está separada en contextos reutilizables

### Debugging

- Verificar localStorage en las herramientas de desarrollador
- Revisar la consola para errores de JavaScript
- Comprobar que el provider esté correctamente configurado en `_app.tsx`
