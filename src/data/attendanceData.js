export const initialHeatmapCells = [
  { day: 1, val: 98, status: 'high' }, { day: 2, val: 96, status: 'high' }, { day: 3, val: 94, status: 'high' },
  { day: 4, val: 92, status: 'high' }, { day: 5, val: 95, status: 'high' }, { day: 6, val: 82, status: 'mid' },
  { day: 7, val: 88, status: 'mid' },  { day: 8, val: 97, status: 'high' }, { day: 9, val: 99, status: 'high' },
  { day: 10, val: 78, status: 'low' }, { day: 11, val: 96, status: 'high' }, { day: 12, val: 94, status: 'high' },
  { day: 13, val: 91, status: 'high' }, { day: 14, val: 90, status: 'high' }, { day: 15, val: 89, status: 'mid' },
  { day: 16, val: 97, status: 'high' }, { day: 17, val: 96, status: 'high' }, { day: 18, val: 95, status: 'high' },
  { day: 19, val: 94, status: 'high' }, { day: 20, val: 93, status: 'high' }, { day: 21, val: 82, status: 'mid' },
  { day: 22, val: 84, status: 'mid' },  { day: 23, val: 96, status: 'high' }, { day: 24, val: 95, status: 'high' },
  { day: 25, val: 98, status: 'high' }, { day: 26, val: 97, status: 'high' }, { day: 27, val: 94, status: 'high' },
  { day: 28, val: 91, status: 'high' }, { day: 29, val: 89, status: 'mid' },  { day: 30, val: 90, status: 'high' },
  { day: 31, val: 95, status: 'high' }
];

export const initialAnomalies = [
  { id: 1, name: 'Sarah Miller', type: 'Geo-fence Breach', desc: 'Checked in from Austin Remote (45km outside approved geofence perimeter)', time: '08:42 AM', severity: 'High' },
  { id: 2, name: 'David Chen', type: 'Clock sync Conflict', desc: 'Simultaneous web portal and physical turnstile scans registered within 3 minutes', time: '09:05 AM', severity: 'Medium' }
];

export const initialAttendanceRecords = [
  { id: 1, name: 'Sarah Wu', role: 'Head of Engineering', mode: 'Office', timeIn: '08:52 AM', timeOut: '06:05 PM', status: 'Compliant', coords: '30.2672° N, 97.7431° W' },
  { id: 2, name: 'Julian Day', role: 'Design Director', mode: 'Office', timeIn: '09:12 AM', timeOut: '05:30 PM', status: 'Lateness Flag', coords: '30.2672° N, 97.7431° W' },
  { id: 3, name: 'Elena Rodriguez', role: 'VP Growth', mode: 'WFH', timeIn: '08:30 AM', timeOut: '05:00 PM', status: 'Compliant', coords: 'Approved Remote Scope' },
  { id: 4, name: 'Marcus Thorne', role: 'Senior Lead Dev', mode: 'Office', timeIn: '08:45 AM', timeOut: '06:15 PM', status: 'Compliant', coords: '30.2672° N, 97.7431° W' },
  { id: 5, name: 'Amara Kante', role: 'Product Manager', mode: 'Field', timeIn: '09:00 AM', timeOut: '05:30 PM', status: 'Compliant', coords: 'Client Onsite Operations' }
];
