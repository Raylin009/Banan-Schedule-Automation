const { getBREventList, initCalendar } = require('./calendarAPIv2.js');
const { getMessageList, getMessageContent, parseMessageContent, initGmail } = require('./gmailAPIv2.js');
const fs = require('fs');

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
  /* Phase I : populate schedule*/
  //in the order of oldest email to the newest
    //include all the dates in the emal
  //populate and update the master schedule

  //get emal list
  const emailListParam = {
    userId: 'me',
    includeSpamTrash: false,
    labelIds: 'INBOX',
    maxResults: 5,
    q: 'from:no-reply-ams@infor.com'
  };
  const email_Id_List = await get_Email_Ids(emailListParam)
  // return(email_Id_List)
  //*** HAVE EMAIL ID ARRAY */

  const email_Content_List = await Promise.all(
    email_Id_List.map((ele) => (getMessageContent(ele.id)))
  )

  //*** HAVE EMAIL CONTENT ARRAY */

  const shifts_Array = email_Content_List.map((email) => {
    if(email.payload.mimeType === "text/html"){
      //parser 1
    }else if(email.payload.mimeType === "text/plain"){
      //paresr 2
    }else{
      //alert me
    }
  })


  return email_Content_List



  /* 
  parse email
    need to get: 
      id, 
      payload.headers[
        From, 
        Subject,
        Date,(recieved date)
        Content-Type: 
          "text/html; charset=ISO-8859-1" (monthly)
          "text/plain; charset=UTF-8" (weekly)
      ]
      payload.mimeType: 
        "text/plain" || "text/html"
      body.data
  */

  /* Phase II: 
  //interate through the master schedule
  //make changes to calendar accordingly  
  */
}

// console.log('ha')
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