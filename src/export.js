/* ============================================
   PDF EXPORT UTILITIES
   ============================================ */

const ExportManager = (() => {
    // Format data for export
    function prepareExportData(user, timesheetData, weekStart) {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        let totalHours = 0;
        let daysWorked = 0;
        const processedData = [];

        timesheetData.forEach((day) => {
            if (day.hours > 0) {
                totalHours += parseFloat(day.hours);
                daysWorked++;
            }

            processedData.push({
                ...day,
                hoursFormatted: day.hours > 0 ? day.hours.toFixed(2) : '-',
                dateFormatted: formatDateFull(day.date)
            });
        });

        const avgHours = daysWorked > 0 ? (totalHours / daysWorked).toFixed(2) : '0.00';

        return {
            user: {
                fullName: `${user.firstName} ${user.lastName}`,
                firstName: user.firstName,
                lastName: user.lastName,
                ird: user.ird,
                passport: user.passport,
                address: user.address,
                taxCode: user.taxCode
            },
            week: {
                start: weekStart,
                end: weekEnd,
                startFormatted: `${weekStart.getDate()} de ${monthNames[weekStart.getMonth()]} de ${weekStart.getFullYear()}`,
                endFormatted: `${weekEnd.getDate()} de ${monthNames[weekEnd.getMonth()]} de ${weekEnd.getFullYear()}`,
                label: `${weekStart.getDate()} al ${weekEnd.getDate()} de ${monthNames[weekStart.getMonth()]}`
            },
            summary: {
                totalHours: totalHours.toFixed(2),
                daysWorked,
                avgHours,
                generatedDate: new Date().toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            },
            data: processedData
        };
    }

    // Format date to full display format
    function formatDateFull(dateStr) {
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const date = new Date(dateStr + 'T00:00:00');
        return `${String(date.getDate()).padStart(2, '0')} ${monthNames[date.getMonth()]}`;
    }

    // Generate professional PDF
    function generatePDF(user, timesheetData, weekStart) {
        const exportData = prepareExportData(user, timesheetData, weekStart);
        
        // Create document element
        const docElement = createPDFDocument(exportData);
        
        // PDF options
        const options = {
            margin: 10,
            filename: `Timesheet_${user.firstName.replace(/\s+/g, '_')}_${user.lastName.replace(/\s+/g, '_')}_${weekStart.toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, allowTaint: true, useCORS: true },
            jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
        };

        // Generate PDF
        html2pdf().set(options).from(docElement).save();
    }

    // Create PDF document HTML
    function createPDFDocument(data) {
        const { user, week, summary, data: timesheetRows } = data;

        const rows = timesheetRows.map(row => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 11px;">${row.day}</td>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 11px;">${row.dateFormatted}</td>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 11px;">${row.workType || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 11px;">${row.orchard || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center;">${row.startTime || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center;">${row.amBreak ? 'SI' : 'NO'}</td>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center;">${row.pmBreak ? 'SI' : 'NO'}</td>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center;">${row.endTime || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center; font-weight: bold; color: #0066cc;">${row.hoursFormatted}</td>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 10px;">${row.notes || '-'}</td>
            </tr>
        `).join('');

        const doc = document.createElement('div');
        doc.innerHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.5;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%); color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🌾</div>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700;">AgriTime Pro</h1>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Reporte Profesional de Jornadas Laborales</p>
                </div>

                <!-- Period Info -->
                <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0066cc; margin-bottom: 25px; font-size: 13px;">
                    <strong>Período Reportado:</strong> ${week.label} de ${week.start.getFullYear()}
                </div>

                <!-- User Information in Two Columns -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <!-- User Data Column 1 -->
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #0066cc;">
                        <div style="font-weight: 700; color: #1a365d; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Datos Personales
                        </div>
                        <div style="font-size: 12px; line-height: 1.8;">
                            <div><strong>Nombre Completo:</strong></div>
                            <div style="margin-bottom: 10px; color: #666;">${user.fullName}</div>
                            
                            <div><strong>IRD:</strong></div>
                            <div style="margin-bottom: 10px; color: #666;">${user.ird}</div>
                            
                            <div><strong>Pasaporte:</strong></div>
                            <div style="color: #666;">${user.passport}</div>
                        </div>
                    </div>

                    <!-- User Data Column 2 -->
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #22b55f;">
                        <div style="font-weight: 700; color: #1a365d; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Información Fiscal
                        </div>
                        <div style="font-size: 12px; line-height: 1.8;">
                            <div><strong>Domicilio:</strong></div>
                            <div style="margin-bottom: 10px; color: #666;">${user.address}</div>
                            
                            <div><strong>Tax Code:</strong></div>
                            <div style="margin-bottom: 10px; color: #666;">${user.taxCode}</div>
                            
                            <div><strong>Fecha Generación:</strong></div>
                            <div style="color: #666;">${summary.generatedDate}</div>
                        </div>
                    </div>
                </div>

                <!-- Timesheet Table -->
                <div style="margin-bottom: 25px;">
                    <div style="font-weight: 700; color: #1a365d; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0066cc; padding-bottom: 8px;">
                        Detalle de Jornadas Laborales
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%); color: white;">
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: 700;">Día</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: 700;">Fecha</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: 700;">Tipo Trabajo</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: 700;">Huerto</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 700;">Inicio</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 700;">AM Break</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 700;">PM Break</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 700;">Fin</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 700; background: #0066cc;">Horas</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: 700;">Notas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>

                <!-- Summary Statistics -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #0066cc; text-align: center;">
                        <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 8px; font-weight: 600;">Total Horas</div>
                        <div style="font-size: 24px; font-weight: 700; color: #0066cc;">${summary.totalHours}</div>
                    </div>
                    <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #1a365d; text-align: center;">
                        <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 8px; font-weight: 600;">Días Trabajados</div>
                        <div style="font-size: 24px; font-weight: 700; color: #1a365d;">${summary.daysWorked}</div>
                    </div>
                    <div style="background: #efe; padding: 15px; border-radius: 8px; border-left: 4px solid #22b55f; text-align: center;">
                        <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 8px; font-weight: 600;">Promedio Horas/Día</div>
                        <div style="font-size: 24px; font-weight: 700; color: #22b55f;">${summary.avgHours}</div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="border-top: 2px solid #ddd; padding-top: 15px; text-align: center; font-size: 11px; color: #999;">
                    <p style="margin: 0 0 8px 0;">Documento generado automáticamente por AgriTime Pro</p>
                    <p style="margin: 0;">Este reporte es válido sin firma digital. Período: ${week.startFormatted} al ${week.endFormatted}</p>
                </div>
            </div>
        `;

        return doc;
    }

    return {
        generatePDF,
        prepareExportData
    };
})();

// Override exportToPDF function to use ExportManager
function exportToPDF() {
    const user = AppCore.getCurrentUser();
    const data = AppCore.getTimesheetData();
    const weekStart = AppCore.getCurrentWeekStart();
    
    ExportManager.generatePDF(user, data, weekStart);
}
