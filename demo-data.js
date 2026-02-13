// Datos de ejemplo para demostración
// Descomenta el contenido de esta función en la consola para cargar datos de prueba

function loadDemoData() {
    const demoData = {
        "2024-02-12": {
            "paid": true,
            "days": [
                {
                    "date": "2024-02-12",
                    "day": "Lunes",
                    "orchard": "Rio Orchard",
                    "workType": "Tutoring",
                    "startTime": "08:00",
                    "endTime": "17:00",
                    "amBreak": true,
                    "pmBreak": true,
                    "notes": "✓"
                },
                {
                    "date": "2024-02-13",
                    "day": "Martes",
                    "orchard": "Rio Orchard",
                    "workType": "Tutoring",
                    "startTime": "08:00",
                    "endTime": "17:00",
                    "amBreak": true,
                    "pmBreak": true,
                    "notes": "✓"
                },
                {
                    "date": "2024-02-14",
                    "day": "Miércoles",
                    "orchard": "Rio Orchard",
                    "workType": "Riego",
                    "startTime": "07:00",
                    "endTime": "15:00",
                    "amBreak": true,
                    "pmBreak": false,
                    "notes": "🌧️ Lluvia por la tarde"
                },
                {
                    "date": "2024-02-15",
                    "day": "Jueves",
                    "orchard": "Rio Orchard",
                    "workType": "Cosecha",
                    "startTime": "08:00",
                    "endTime": "18:00",
                    "amBreak": true,
                    "pmBreak": true,
                    "notes": "✓"
                },
                {
                    "date": "2024-02-16",
                    "day": "Viernes",
                    "orchard": "Santa Clara",
                    "workType": "Tutoring",
                    "startTime": "08:00",
                    "endTime": "16:30",
                    "amBreak": true,
                    "pmBreak": true,
                    "notes": "✓"
                },
                {
                    "date": "2024-02-17",
                    "day": "Sábado",
                    "orchard": "Rio Orchard",
                    "workType": "Mantenimiento",
                    "startTime": "09:00",
                    "endTime": "13:00",
                    "amBreak": false,
                    "pmBreak": false,
                    "notes": "✓"
                },
                {
                    "date": "2024-02-18",
                    "day": "Domingo",
                    "orchard": "",
                    "workType": "",
                    "startTime": "",
                    "endTime": "",
                    "amBreak": false,
                    "pmBreak": false,
                    "notes": "🆓"
                }
            ]
        }
    };

    localStorage.setItem('timesheetData', JSON.stringify(demoData));
    
    // Guardar ubicación de ejemplo
    const demoLocation = {
        "lat": 37.3382,
        "lng": -121.8863,
        "address": "Rio Orchards, California, USA"
    };
    localStorage.setItem('orchardLocation', JSON.stringify(demoLocation));

    alert('✅ Datos de demostración cargados correctamente!\nRecarga la página para ver los cambios.');
    location.reload();
}

// Instrucciones de uso:
// 1. Abre la consola del navegador (F12)
// 2. Pega el contenido de este archivo
// 3. Ejecuta: loadDemoData()
// 4. Se cargarán datos de ejemplo automáticamente
