const { getBREventList, initCalendar } = require('./calendarAPIv2.js');
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
    maxResults: 5,
    q: 'from:no-reply-ams@infor.com'
  };
  const email_Id_List = await get_Email_Ids(emailListParam)

  //*** HAVE EMAIL ID ARRAY */

  const email_Content_List = await Promise.all(
    email_Id_List.map((ele) => (getMessageContent(ele.id)))
  )
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
    masterSchedule = {
      ...masterSchedule,
      ...shiftsInEmail,
    }
  })

  // console.log(masterSchedule)
  return masterSchedule
}

auto_update_shift()
.then(console.log)
.catch(console.log)



// get_Email_Content({
//   userId: 'me',
//   id: '176794e0d843c7c5',
//   format: "full",
// })
// .then(console.log)
// .catch(console.log)