# 🌳 Orchard Timesheet Pro

Sistema profesional y moderno para la gestión de jornadas laborales en trabajos de huerto. Diseñado específicamente para registrar horas, breaks, ubicaciones y estado de pago de manera intuitiva.

## ✨ Características Principales

### 📊 Gestión de Horas
- **Hora de Inicio y Fin**: Registra los tiempos de trabajo automáticamente
- **Cálculo Automático**: Las horas trabajadas se calculan automáticamente descontando breaks
- **AM/PM Breaks**: Checkboxes para marcar descansos (30 min cada uno)
- **Visualización Clara**: Muestra el total de horas por día en la tabla

### 📅 Gestión de Fechas
- **Navegación Semanal**: Selecciona semanas anteriores o futuras fácilmente
- **Día y Fecha Personalizables**: Edita manualmente el día y la fecha si es necesario
- **Detección Automática**: El sistema identifica automáticamente el día de la semana según la fecha

### 📍 Ubicación del Huerto
- **Selector de Ubicación**: Interfaz tipo mapa para seleccionar la ubicación del huerto
- **Persistencia**: La ubicación se guarda automáticamente
- **Visualización**: Muestra coordenadas e información de la ubicación seleccionada

### 💰 Estado de Pago
- **Toggle Semanal**: Marca si se cobró la semana completa
- **Indicador Visual**: 
  - 🟢 Verde: Semana pagada
  - 🔴 Rojo: Semana no pagada
- **Sincronización**: El estado se refleja en toda la tabla

### 🎯 Notas y Status
- **Registro de Eventos**: Añade emojis y notas especiales como:
  - 🌧️ Lluvia
  - 😷 No asistió
  - 🆓 Día libre
  - Cualquier nota personalizada

### 📱 Interfaz Profesional
- **Diseño Responsivo**: Se adapta a cualquier dispositivo
- **Tema Verde Agrícola**: Colores profesionales inspirados en naturaleza
- **Video de Fondo**: Encabezado con video decorativo
- **Animaciones Suaves**: Transiciones elegantes y fluidas

### 📈 Estadísticas
- **Horas Totales**: Suma automática de horas trabajadas por semana
- **Días Trabajados**: Contador de días con registro de horas
- **Actualización en Tiempo Real**: Se actualiza mientras escribes

### 💾 Almacenamiento
- **Local Storage**: Todos los datos se guardan localmente en el navegador
- **Persistencia Automática**: Los cambios se guardan al instante
- **Sin Conexión Requerida**: Funciona completamente offline

### 📤 Exportación
- **Exportar PDF**: Descarga un PDF imprimible con todos los datos de la semana
- **Formato Profesional**: Incluye todos los detalles relevantes

## 🚀 Cómo Usar

### Instalación
1. Clona o descarga el proyecto
2. No requiere instalación adicional - solo abre `index.html` en tu navegador

### Navegación Rápida
- **Semana Anterior/Próxima**: Usa los botones de navegación
- **Seleccionar Ubicación**: Click en "Seleccionar Ubicación" en el panel lateral

### Registrar Jornada
1. Ingresa la **Hora de Inicio**
2. Marca los **Breaks** si aplica
3. Ingresa la **Hora de Fin**
4. Las horas se calculan automáticamente
5. Agrega **Notas** si es necesario

### Marcar Semana como Pagada
- Toggle en "Estado de Pago" en el panel lateral
- La tabla cambiará de color automáticamente

### Editar Día Completo
- Click en "Editar" en la fila del día
- Modifica cualquier campo de la jornada
- Haz click en "Guardar"

## 🎨 Estructura del Proyecto

```
ASPEN/
├── index.html              # Página principal
├── package.json            # Configuración del proyecto
├── README.md               # Este archivo
├── assets/
│   └── styles/
│       └── styles.css      # Estilos profesionales
└── src/
    └── app.js              # Lógica de la aplicación
```

## 🔧 Funcionalidades Técnicas

### Cálculo de Horas
El sistema calcula automáticamente:
- Diferencia entre hora inicio y fin
- Descuenta 30 minutos por cada break activo
- Evita valores negativos
- Precisión de dos decimales

### Almacenamiento de Datos
- **Formato**: JSON estructurado por semana
- **Ubicación**: LocalStorage del navegador
- **Sincronización**: Se actualiza al cambiar cualquier campo

### Compatibilidad
- Chrome/Edge ✅
- Firefox ✅
- Safari ✅
- Navegadores móviles ✅

## 📊 Datos Almacenados por Día

Cada día registra:
- Fecha
- Día de la semana
- Nombre del huerto
- Tipo de trabajo
- Hora de inicio
- Hora de fin
- AM Break (sí/no)
- PM Break (sí/no)
- Notas especiales

## 🌐 Datos Almacenados Globales

- Ubicación del huerto (coordenadas)
- Estado de pago de cada semana
- Todos los registros diarios

## 🎯 Mejoras Futuras

- [ ] Sincronización con cloud
- [ ] Múltiples usuarios
- [ ] Gráficos de análisis
- [ ] Integración con calendario
- [ ] Exportación a Excel
- [ ] Notificaciones de recordatorios

## 📝 Notas de Uso

**Importante**: Este sistema utiliza LocalStorage del navegador. Los datos se guardan localmente y no se pierden al cerrar la pestaña, pero sí se perderán si limpias el caché/datos del navegador.

**Recomendación**: Realiza exportaciones periódicas como respaldo.

## 🔒 Privacidad

Todos los datos se guardan localmente en tu navegador. No se envía información a servidores externos (excepto el video de YouTube del header que se carga automáticamente).

## 📞 Soporte

Para problemas o sugerencias, contacta al administrador del sistema.

---

**Versión**: 1.0.0  
**Última Actualización**: 2024  
**Desarrollado con ❤️ para trabajadores agrícolas**
