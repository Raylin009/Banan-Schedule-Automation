/*
  it will be used as follows
  cosnt brShift = require(./brShift)

  cosnt shift_keys = [
    "DATE/L'DATE/LA FECHA",
    'SCHEDULE/LE PLANNING/EL HORARIO',
    'UPDATED/MIS C\x00 JOUR/ACTUALIZADO',
    'DEPARTMENT/DC\tPARTEMENT/DEPARTAMENTO',
    'ACTIVITY/ACTIVITC\t/ACTIVIDAD',
    'STORE/LE MAGASIN/LA TIENDA',
    'JOB/LE TRAVAIL/EL TRABAJO'
  ]

  const shift_val_notScheduled = [ 'Sun/Dim/Dom 12/06/2020', '-', 'No/Non/No', '', '', '', '' ]
  const shift_val_Scheduled = [
    'Sun/Dim/Dom 12/13/2020',
    '02:00 PM - 10:00 PM',
    'No/Non/No',
    '01049_OUTL_RECOVERY',
    'WRK',
    '01049_OUTL',
    'OUT_RECOVERY'
  ]
  const shift = brShift("HTML", shift_keys)
  const curShift = new shift(shift_val_notScheduled)
  const dateWithShift = {
    date: 12/06/2020,
    schedule: [],
    updated: false,
    department: null,
    activity: null,
    store: null,
    job: null,
  };
  const dateWithOUTShift = {
    date: 12/13/2020,
    schedule: ['02:00 PM', '10:00 PM'],
    updated: false,
    department: '01049_OUTL_RECOVERY',
    activity: 'WRK',
    store: '01049_OUTL',
    job: 'OUT_RECOVERY',
  };
*/