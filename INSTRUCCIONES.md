# 🚀 INSTRUCCIONES DE INICIO RÁPIDO

## Opción 1: Con Python (Recomendado)

### Windows
1. Abre **PowerShell** o **Cmd** en la carpeta del proyecto
2. Ejecuta:
   ```powershell
   python -m http.server 8000
   ```
3. Abre tu navegador y ve a: **http://localhost:8000/START.html**
4. ¡Listo! Presiona las teclas `Ctrl + C` para detener cuando termines

### MAC / Linux
1. Abre **Terminal** en la carpeta del proyecto
2. Ejecuta:
   ```bash
   python3 -m http.server 8000
   ```
3. Abre tu navegador y ve a: **http://localhost:8000/START.html**
4. Para detener: Presiona `Ctrl + C`

## Opción 2: Inicio Rápido en Windows

1. **Haz doble clic** en el archivo `START.bat`
2. La aplicación se abrirá automáticamente en tu navegador
3. Para detener el servidor, cierra la ventana de comando

## Opción 3: Abrir Directamente

Si no quieres usar servidor:
1. Abre el archivo `START.html` directamente desde el explorador
2. O arrastra `START.html` a tu navegador

*(Nota: Algunas características pueden limitar funcionalidad sin servidor)*

## ✨ Características que Funcionan

✅ Tabla de timesheet completa
✅ Cálculo automático de horas
✅ Checkboxes para breaks
✅ Guardado automático (LocalStorage)
✅ Export a PDF
✅ Toggle de pago semanal
✅ Selección de ubicación (sin API key)
✅ Emojis para notas especiales
✅ Estatus visual (verde/rojo)
✅ Totalmente responsive

## 📱 Acceso Móvil

Si quieres acceder desde tu teléfono en la misma red:
1. Abre PowerShell y ejecuta: `ipconfig`
2. Busca "IPv4 Address" (algo como 192.168.x.x)
3. En tu teléfono, ve a: **http://<tu-ip>:8000/START.html**
   *(Reemplaza <tu-ip> con tu dirección IPv4)*

## 🔧 Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Python 3.x (solo si usas servidor)
- Conexión a Internet (para video del header y Google Maps, opcional)

## 📂 Estructura de Archivos

```
ASPEN/
├── START.html            ← Página de bienvenida
├── START.bat             ← Script para Windows
├── index.html            ← Aplicación principal
├── README.md             ← Documentación completa
├── package.json          ← Información del proyecto
├── src/
│   ├── app.js           ← Lógica de la aplicación
│   └── config.js        ← Configuración
├── assets/
│   └── styles/
│       └── styles.css   ← Estilos profesionales
└── demo-data.js         ← Datos de ejemplo
```

## 💾 Datos

- **Ubicación**: De almacenamiento local en tu navegador
- **Privacidad**: Todos los datos permanecen en tu computadora
- **Respaldo**: Exporta a PDF regularmente

## ⚠️ Importante

- Los datos se guardan **localmente en tu navegador**
- Si limpias el cache/cookies, se perderán los datos
- Haz backup exportando a PDF
- Compatible con todos los navegadores modernos

## 🆘 Problemas?

### El mapa no funciona
- Esto es normal sin API key de Google Maps
- Puedes ingresar coordenadas manualmente
- La aplicación sigue funcionando perfectamente

### El servidor no inicia
- Verifica tener Python instalado: `python --version`
- Intenta con `python3` si estás en Mac/Linux
- O simplemente abre los archivos HTML directamente

### Los datos no se guardan
- Verifica que tu navegador permite LocalStorage
- Intenta en modo no privado/incógnito
- Revisa la consola del navegador (F12)

## 📞 Soporte

Para Issues o sugerencias, contacta al administrador del proyecto.

---

**¡Disfruta usando Orchard Timesheet Pro!** 🌳
