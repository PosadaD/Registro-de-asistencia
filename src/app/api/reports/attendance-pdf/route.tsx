import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, textAlign: 'center', fontSize: 12, fontWeight: 'bold', borderBottom: 1, paddingBottom: 10 },
  subheader: { marginBottom: 10, fontSize: 11, flexDirection: 'row', justifyContent: 'space-between' },
  table: { display: 'table', width: '100%', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', alignItems: 'center', minHeight: 25 },
  tableHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
  tableCell: { flex: 1, padding: 5, textAlign: 'center' },
  cellDay: { flex: 0.8 },
  cellObs: { flex: 1 },
  cellTime: { flex: 1.2 },
  cellSignature: { flex: 1.5 },
  signatureImage: { width: 30, height: 30, margin: 'auto' },
  monthTitle: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
});

async function generateQRBase64(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, { errorCorrectionLevel: 'H', margin: 1, width: 100 });
  } catch { return ''; }
}

function getBusinessDays(year: number, month: number): { dayNumber: number; dayName: string }[] {
  const days: { dayNumber: number; dayName: string }[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      days.push({
        dayNumber: d.getDate(),
        dayName: format(d, 'EEEE', { locale: es }).substring(0, 2).toUpperCase(),
      });
    }
  }
  return days;
}

export async function POST(request: NextRequest) {
  try {
    const { employeeId, month, year } = await request.json();
    await connectDB();

    const employees = await Employee.find(employeeId && employeeId !== 'all' ? { _id: employeeId } : {}).lean();
    if (!employees.length) return NextResponse.json({ error: 'No hay empleados' }, { status: 404 });

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const attendances = await Attendance.find({
      employeeId: { $in: employees.map(e => e._id) },
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    const attendanceMap: Record<string, Record<string, any>> = {};
    attendances.forEach(att => {
      const empId = att.employeeId.toString();
      const dateKey = format(new Date(att.date), 'yyyy-MM-dd');
      if (!attendanceMap[empId]) attendanceMap[empId] = {};
      attendanceMap[empId][dateKey] = att;
    });

    const businessDays = getBusinessDays(year, month);
    const pdfPages = await Promise.all(employees.map(async (employee) => {
      const empId = employee._id.toString();
      const signatureText = employee.faceDescriptorHash || employee.virtualSignature || 'Sin firma';
      const qrBase64 = await generateQRBase64(signatureText);
      const empAttendances = attendanceMap[empId] || {};

      const rows = businessDays.map(({ dayNumber, dayName }) => {
        const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(dayNumber).padStart(2,'0')}`;
        const att = empAttendances[dateKey];
        let checkIn = '', checkOut = '';
        if (att) {
          if (!att.isLate && !att.isAbsent) {
            checkIn = employee.workSchedule?.startTime || '09:00';
            checkOut = employee.workSchedule?.endTime || '13:00';
          } else if (att.isAbsent) {
            checkIn = '--'; checkOut = '--';
          } else {
            checkIn = att.checkIn || '--';
            checkOut = att.checkOut || '--';
          }
        } else {
          checkIn = '--'; checkOut = '--';
        }
        return (
          <View style={styles.tableRow} key={dateKey}>
            <Text style={[styles.tableCell, styles.cellDay]}>{dayName} {dayNumber}</Text>
            <Text style={[styles.tableCell, styles.cellObs]}></Text>
            <Text style={[styles.tableCell, styles.cellTime]}>{checkIn}</Text>
            <View style={[styles.tableCell, styles.cellSignature]}>
              {att ? <Image src={qrBase64} style={styles.signatureImage} /> : null}
            </View>
            <Text style={[styles.tableCell, styles.cellTime]}>{checkOut}</Text>
            <View style={[styles.tableCell, styles.cellSignature]}>
              {att ? <Image src={qrBase64} style={styles.signatureImage} /> : null}
            </View>
          </View>
        );
      });

      return (
        <Page key={empId} size="A4" style={styles.page}>
          <Text style={styles.header}>CONTROL DE ACCESO DE PRESTADORES DE SERVICIO SOCIAL Y/O PRÁCTICAS PROFESIONALES</Text>
          <View style={styles.subheader}>
            <Text>Nombre del prestador: {employee.name}</Text>
          </View>
          <View style={styles.subheader}>
            <Text>{employee.providerType || 'No especificado'}</Text>
            <Text>Unidad Administrativa: ADSC Aguascalientes</Text>
          </View>
          <Text style={styles.monthTitle}>{format(new Date(year, month), 'MMMM yyyy', { locale: es }).toUpperCase()}</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.cellDay]}>Día</Text>
              <Text style={[styles.tableCell, styles.cellObs]}>Obs.</Text>
              <Text style={[styles.tableCell, styles.cellTime]}>Hora entrada</Text>
              <Text style={[styles.tableCell, styles.cellSignature]}>Firma</Text>
              <Text style={[styles.tableCell, styles.cellTime]}>Hora salida</Text>
              <Text style={[styles.tableCell, styles.cellSignature]}>Firma</Text>
            </View>
            {rows}
          </View>
        </Page>
      );
    }));

    const pdfBuffer = await renderToBuffer(<Document>{pdfPages}</Document>);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=asistencias_${year}-${month+1}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}