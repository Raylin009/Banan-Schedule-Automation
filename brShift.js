const brHtmlTempProcessor = (strType, str, index) => {
  if(strType === "OBJ_KEY"){
    const key = str.split('/')[0]
    return key.toLowerCase()
  }else if(strType === "OBJ_VAL"){
    switch (index) {
      case 0:
        return str.split(' ')[1]
      case 1:
        let timeRange = [];
        if(str.length > 3){
          timeRange = str.split(" - ")
        }
        return timeRange
      case 2:
        return str.split('/')[0] === 'Yes'
      default:
        return str.length ? str : null;
    }
  }else{
    throw Error ('brHtmlTempProcessor input has issue')
  }
}

const brShift = (flag, keyArr) => {
  if(flag === "HTML"){
    let shiftTemplate = {}
    keyArr.forEach((ele, index)=> {
      const key = brHtmlTempProcessor("OBJ_KEY",ele);
      if(!shiftTemplate.hasOwnProperty(key)){
        shiftTemplate[key] = null;
      }
    })
    return (valueArr) => {
      const shift = {...shiftTemplate}
      let valIndex = 0;
      for(const key in shift){
        const val = valueArr[valIndex]
        const val_parsed = brHtmlTempProcessor("OBJ_VAL", val, valIndex)
        shift[key] = val_parsed;
        valIndex += 1;
      }
      return shift;
    }

  }else if(flag === "PLAN_TEXT"){
    let valArr = keyArr;
    let shiftHours = null
    if(!!valArr[2]){
      if(valArr[2].includes("PM") || valArr[2].includes("AM")){
        shiftHours = valArr[2].split(" - ")
      }
    }
    const plTxtShiftTemp = {
      date: valArr[1] || null,
      schedule: shiftHours|| [],
      updated: null,
      department: valArr[6] || null,
      activity: valArr[3] || null,
      store: valArr[5] || null,
      job: valArr[4] || null,
    }
    return plTxtShiftTemp
  }else{
    throw Error(`brShift function have to have 'flag' value either 'HTML' or 'PLAN_TEXT', instead got ${flag}`)
  }
  //return the class
}

module.exports.brShift = brShift;

/* TEST


const catigories =   [
  "DATE/L'DATE/LA FECHA",
  'SCHEDULE/LE PLANNING/EL HORARIO',
  'UPDATED/MIS C\x00 JOUR/ACTUALIZADO',
  'DEPARTMENT/DC\tPARTEMENT/DEPARTAMENTO',
  'ACTIVITY/ACTIVITC\t/ACTIVIDAD',
  'STORE/LE MAGASIN/LA TIENDA',
  'JOB/LE TRAVAIL/EL TRABAJO'
]
const row_yes = [
  'Sun/Dim/Dom 12/20/2020',
  '02:00 PM - 10:00 PM',
  'Yes/Oui/SC-',
  '01049_OUTL_CASH_WRAP',
  'WRK',
  '01049_OUTL',
  'OUT_CASHIER'
]
const row_no = [ 'Mon/Lun/Lun 12/14/2020', '-', 'No/Non/No', '', '', '', '' ]
const t1 = brShift("HTML", catigories)
const t_yes = t1(row_yes)
const t_no = t1(row_no)

console.log(t_yes);
console.log(t_no);
*/
