const { email_planText, email_html } = require("./testEmailId");
const { brShift } = require("./brShift");
const { parse } = require("node-html-parser");

/**
 getEmailMetaInfo
  Input: Bana Republic Shift Schedule Email Object either in HTML or Plan Text Template
  output: {
    Email_Id,
    From,
    Subject,
    Date recieced,
    Content-Type:
      "text/html; charset=ISO-8859-1" (monthly)
      "text/plain; charset=UTF-8" (weekly)
  }
 */
const getEmailMetaInfo = (emailObj) => {
  let metaData = {}
  const headerMap = new Map();
  emailObj.payload.headers.forEach((ele)=>{
    headerMap.set(ele.name, ele.value)
  });
  metaData.id = emailObj.id
  metaData.dateRecieved = headerMap.get('Date');
  metaData.from = headerMap.get('From');
  metaData.subject = headerMap.get('Subject');
  metaData.content_type = headerMap.get('Content-Type');
  return metaData
};

// const test = getEmailMetaInfo(email_html)
// console.log(test)

/**
  emailParser_base64
    Input: email content body, base64 string
    output: email content
 */
const emailParser_base64 = (base64Code) => {
  //email.payload.body.data
  if(typeof(base64Code) !== "string" ){
    throw Error ('Input for emailParser_base64 have to be string, instead it got '+base64Code)
  }
  return Buffer.from(base64Code, 'base64').toString('ascii')
};

// const test64 = emailParser_base64(email_planText.payload.body.data);
// console.log(test64);

/**
  emailContnetParser_htmlTemplate
    Input: email content with HTML template, string
    output: [
      { stDate,
        stTime,
        endDate,
        endTime,
        acitivity,
        job,
        store,
        department,
      },....
    ]
 */
const emailContnetParser_htmlTemplate = (content) => {
  let schedule = [];
  const htmlContent = parse(`<div>${content}</div>`)
  const table = htmlContent.querySelector('.contentTable')
  const triversTableColumns = (tableRow) => {
    let column = tableRow.firstChild;
    let columnText = [];
    for(;!!column;column = column.nextSibling){
      columnText.push(column.text)
    }
    return(columnText)
  };
  const triviersTableRows = (table) => {
    let row = table.firstChild;
    let rowArr = [];
    for(;!!row;row = row.nextSibling){
      const paresedRow = triversTableColumns(row)
      rowArr.push(paresedRow)
    }
    return rowArr
  };
  //HTML to Matrix success
  // console.log(triviersTableRows(table))
  // console.log(triviersTableRows(table).length)

  const matrixToMasterScheduel = (matrix) => {
    let masterSchedule = {}
    let shiftTemp = brShift("HTML",matrix[0]);
    for(let i = 1; i < matrix.length; i +=1 ){
      const curShift = shiftTemp(matrix[i])
      masterSchedule[curShift.date] = curShift;
    }
    return masterSchedule
  };

const scheduleMatrix = triviersTableRows(table);
const masterSchedule = matrixToMasterScheduel(scheduleMatrix)

return masterSchedule
};
// const test64 = emailParser_base64(email_html.payload.body.data);
// const testhtml = emailContnetParser_htmlTemplate(test64)
// console.log(Object.keys(testhtml).length);

/**
  emailContnetParser_planTextTemplate
    Input: email content with HTML template, string
    output: [
      { stDate,
        stTime,
        endDate,
        endTime,
        acitivity,
        job,
        store,
        department,
      },....
    ]
 */
const emailContnetParser_planTextTemplate = (content) => {
  return content
};

module.exports.getEmailMetaInfo = getEmailMetaInfo;
module.exports.emailParser_base64 = emailParser_base64;
module.exports.emailContnetParser_htmlTemplate = emailContnetParser_htmlTemplate;
module.exports.emailContnetParser_planTextTemplate = emailContnetParser_planTextTemplate


