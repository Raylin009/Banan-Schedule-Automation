const { getBREventList,
        deleteEvent,
        addEvent,
        patch,
        getBREventByDate,
        initCalendar } = require('./calendarAPIv2.js');
const { getMessageList, 
        getMessageContent, 
        parseMessageContent, 
        initGmail 
      } = require('./gmailAPIv2.js');
const { getEmailMetaInfo, 
        emailParser_base64,
        emailContnetParser_htmlTemplate,
        emailContnetParser_planTextTemplate,
      } = require('./emailParser_UTL.js');
// const { email_Id_List } = require('./testEmailId.js')

const get_Email_Ids = async(parameters) => {
  const gmail = await initGmail()
  return new Promise((resolve, reject) => {
    gmail.users.messages.list(parameters, (err, res) => {
      if (err) {return reject(`Error in get_Email_Ids funcrtion.\nParameters:\n${parameters}\n${err}`)};
      const { messages } = res.data;
      resolve(messages)
    })
  })
}


const get_Email_Content = async(parameters) => {
  const gmail = await initGmail()
  return new Promise((resolve, reject) => {
    gmail.users.messages.get(parameters, (err, res) => {
      if (err) {return reject(`Error in get_Email_Content function\nParameters:\n${parameters}\n${err}`)};
      const { data } = res;
      resolve(data)
    })
  })
}

const parseEmail = (emailObj) => {
  if(!emailObj) {
    throw Error(`"parseEmail" function expect input to be valid emailObj but recieved ${emailObj}`)
  }
  const { id, payload } = emailObj
  const metaData = {
    id,
    contentType: payload.mimeType,
  }
  const reducer = (sto, cur) => {
    if(!sto){
      sto = {}
    }
    const reqElements = ['From', 'Subject', 'Date', 'Content-Type'];
    reqElements.forEach((ele) => {
      if(cur.name === ele){
        sto
      }
    })
  }
  payload.headers.reduce()
  
}

const auto_update_shift = async() => {
  const calendar = initCalendar();
  const gmail = initGmail();
  const emailListParam = {
    userId: 'me',
    includeSpamTrash: false,
    labelIds: 'INBOX',
    maxResults: 3,
    q: 'from:no-reply-ams@infor.com'
  };
  const email_Id_List = await get_Email_Ids(emailListParam)

  //*** HAVE EMAIL ID ARRAY */

  const email_Content_List = await Promise.all(
    email_Id_List.map((ele) => (getMessageContent(ele.id)))
  )
  // console.log(email_Content_List)
  //*** HAVE EMAIL CONTENT ARRAY */
  let masterSchedule = {};

  email_Content_List.map((email) => {
    const emailType = email.payload.mimeType;
    const metaInfo = getEmailMetaInfo(email);
    const emailBody = emailParser_base64(email.payload.body.data);
    let shiftsInEmail = {};
    if(emailType === "text/html"){
      shiftsInEmail = emailContnetParser_htmlTemplate(emailBody, metaInfo);
    }else if(emailType === "text/plain"){
      // let year = new Date(metaInfo.dateRecieved)
      // year = JSON.stringify(year.getFullYear());
      shiftsInEmail = emailContnetParser_planTextTemplate(emailBody, metaInfo)
    }else{
      //alert me
      throw Error("email_Content_List mapping problem, see index.js line 86 to 99");
    }
    // masterSchedule = {
    //   ...masterSchedule,
    //   ...shiftsInEmail,
    // }
    for(let key in shiftsInEmail){
      if(!masterSchedule[key]){
        masterSchedule[key] = shiftsInEmail[key]
      }else{
        const masterDate = new Date(masterSchedule[key].dateRecieved)
        const curDate = new Date(shiftsInEmail[key].dateRecieved)
        if(curDate > masterDate){
          masterSchedule[key] = shiftsInEmail[key]
        }
      }
    }
  })

  // console.log(masterSchedule)
  return masterSchedule
}

// auto_update_shift()
// .then()
// // .then((data) => console.log(Object.keys(data).length))
// .catch(console.log)

const { exMasterSchedule } = require('./devHelper/exMasterSchedule.js');

const checkCalHasShift = async (shiftInfo) => {
  const { date, schedule } = shiftInfo;
  const oneDateRane = (date) => {
    const stTime = `${date} 00:00:00`;
    const endTime = `${date} 23:59:59`;
    return [ new Date(stTime), new Date(endTime)];
  }
  const [ stDate, endDate ] = oneDateRane(date);
  const calShiftThatDate = await getBREventByDate(stDate, endDate)
  return calShiftThatDate
};

const testShift = {
  date: '01/26/2021',
  schedule: [ '03:00 PM', '07:00 PM' ],
  updated: true,
  department: '01049_OUTL_SALES_FLOOR',
  activity: 'WRK',
  store: '01049_OUTL',
  job: 'OUT_SALES',
  srcEmailInfo: {
    id: '176dfab727d9a969',
    dateRecieved: 'Fri, 8 Jan 2021 01:45:23 +0000',
    from: 'no-reply-ams@infor.com',
    subject: "Schedule Change Alert/Alerte de changement d'horaire/Programar alerta de cambio",
    content_type: 'text/html; charset=ISO-8859-1'
  }
}



// checkCalHasShift(testShift)
// .then(console.log)
// .catch(console.log)
const updateShiftHist = (calShift, shiftInfo_mst, notes) => {
  console.log("shiftInfo_mst in progress...")
};
const addShift = async(shiftInfo_mst) => {
  let newEvent = null;
  const shiftEvent = generateShiftEvent(shiftInfo_mst)
  try{
    newEvent = await addEvent(shiftEvent);
  }catch (error){
    console.error(`Error occured in adding shifft for ${shiftInfo_mst.date} from ${shiftInfo_mst.srcEmailInfo.dateRecieved} email ${error}`);
  }
}

// addShift(testShift)
// .then(console.log)
// .catch(console.log)

const changeShiftTime = (calShift, shiftInfo_mst) => {
  console.log("changeShiftTime Inprogress...")
  // const dateTimeStr = (date, time) => {
  //   return new Date(`${date} ${time}`).toISOString();
  // }
  // const stDate = dateTimeStr(shiftInfo_mst.date, shiftInfo_mst.schedule[0])
  // const endDate = dateTimeStr(shiftInfo_mst.date, shiftInfo_mst.schedule[1])
  // console.log("stDate",stDate)
  // console.log("endDate",endDate)

  // patch({
  //   // eventId: calShift.id,
  //   eventId: "8um4fnv74r4nu5l5b029cph480",
  //   start:{
  //     dateTime: "2021-01-26T22:00:00.000Z",
  //   },
  //   end: {
  //     dateTime: "2021-01-27T04:00:00.000Z",
  //   }
  // })
  // .then(console.log)
  // .catch(console.log)
}

const testChangeShift = async() => {
  const {id, url} = await addShift(testShift);
  const [calSH] = await getBREventByDate(new Date('01/26/2021 00:00:00'), new Date('01/26/2021 23:59:59'));
  // changeShiftTime(calSH, testPatch_Shift)
  // console.log('newShiftId', id)
  // console.log(calSH)
}

// testChangeShift()
// .then(console.log)
// .catch(console.log)


function generateShiftEvent(shiftInfo_mst) {
  const dateTimeStr = (date, time) => {
    if(!time.includes(' ')){
      /* to handle '04:00PM' and '04:00 PM' */
      const parsedTime = `${time.trim().substring(0,5)} ${time.trim().substring(time.length-2)}`
      return new Date(`${date} ${parsedTime}`).toISOString();
    }
    return new Date(`${date} ${time}`).toISOString();
  }
  const stDate = dateTimeStr(shiftInfo_mst.date, shiftInfo_mst.schedule[0])
  const endDate = dateTimeStr(shiftInfo_mst.date, shiftInfo_mst.schedule[1])

  const calEvenResource = {
    'summary': `Banana ${shiftInfo_mst.schedule[0]} - ${shiftInfo_mst.schedule[1]}`,
    'location': '2990 Livermore Outlets Dr SUITE 2990, Livermore, CA 94551',
    'description': `${JSON.stringify(shiftInfo_mst)}\n${JSON.stringify(shiftInfo_mst.srcEmailInfo)}`,
    'start': {
      'dateTime': stDate,
      'timeZone': 'America/Los_Angeles',
    },
    'end': {
      'dateTime': endDate,
      'timeZone': 'America/Los_Angeles',
    },
    'attendees': [
    ],
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'popup', 'minutes': 10},
      ],
    },
  };
  return calEvenResource;
};


const addShiftsToCalendar = async(masterSchedule) => {
  for(let shiftDate in masterSchedule){
    const shiftInfo_mst = masterSchedule[shiftDate];
    if(shiftInfo_mst.schedule.length){
      addShift(shiftInfo_mst)
      // .then(console.log)
      .catch(console.log)
    }

    // .then(console.log(`Added shift on ${shiftDate} from ${shiftInfo_mst.schedule[0]} to ${shiftInfo_mst.schedule[1]}`));

  }
  return "addShiftsToCalendar complete"
}

const { hasShift, noShift} = require('./devHelper/exMasterSchedule.js');

auto_update_shift()
// .then((data) => {
//   return {
//     '02/14/2021':data['02/14/2021'],
//     '02/16/2021':data['02/16/2021'],
//     '02/17/2021':data['02/17/2021'],
//   }
// })
// .then(console.log)
.then((data) => addShiftsToCalendar(data))
// .then((data) => {
//   const arr = Object.keys(data).sort((a,b)=> {
//     const dateA = Date.parse(new Date(a));
//     const dateB = Date.parse(new Date(b))
//     return dateA - dateB;
//   })
//   arr.forEach((ele) => {
//     console.log(ele, data[ele].schedule)
//   })
// })
.catch(console.log)



// get_Email_Content({
//   userId: 'me',
//   id: '176794e0d843c7c5',
//   format: "full",
// })
// .then(console.log)
// .catch(console.log)