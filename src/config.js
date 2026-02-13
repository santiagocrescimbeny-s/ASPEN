// Configuración de la aplicación
const CONFIG = {
    APP_NAME: 'Orchard Timesheet Pro',
    VERSION: '1.0.0',
    STORAGE_KEY: 'timesheetData',
    LOCATION_KEY: 'orchardLocation',
    
    // Configuración de horas
    AM_BREAK_MINUTES: 30,
    PM_BREAK_MINUTES: 30,
    
    // Colores
    COLORS: {
        PRIMARY: '#2d5016',
        PRIMARY_LIGHT: '#4a7c2c',
        PRIMARY_DARK: '#1a3009',
        SECONDARY: '#d4a574',
        SUCCESS: '#10b981',
        DANGER: '#ef4444',
        WARNING: '#f59e0b'
    },
    
    // Ubicación por defecto (California Orchards)
    DEFAULT_LOCATION: {
        lat: 37.3382,
        lng: -121.8863,
        address: 'Región de Huertos, California'
    },
    
    // Tipos de trabajo recomendados
    WORK_TYPES: [
        'Tutoring',
        'Riego',
        'Cosecha',
        'Podas',
        'Mantenimiento',
        'Fertilización',
        'Inspección',
        'Empaque'
    ],
    
    // Emojis disponibles para notas
    STATUS_EMOJIS: {
        OK: '✓',
        RAIN: '🌧️',
        NO_SHOW: '😷',
        DAY_OFF: '🆓',
        VACATION: '🏖️',
        SICK: '🤒',
        HOLIDAY: '🎉'
    },
    
    // Formato de fecha
    DATE_FORMAT: 'es-ES',
    TIME_FORMAT: '24h'
};

// Utilidades
const Utils = {
    // Debounce para ahorro de recursos
    debounce: function(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    // Throttle para control de lluvia de eventos
    throttle: function(func, limit) {
        let lastFunc;
        let lastRan;
        return function(...args) {
            if (!lastRan) {
                func.apply(this, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },
    
    // Notificación visual
    showNotification: function(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};
