const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

const testEmailContentParserv2 = (auth) => {
  getMessageContent(auth, "175c4fc236fa7270")
}
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  // authorize(JSON.parse(content), getMessageList);
  authorize(JSON.parse(content), testEmailContentParserv2);

});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function getMessageList(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.messages.list({
    userId: 'me',
    includeSpamTrash: false,
    labelIds: 'INBOX',
    maxResults: 10,
    q: 'from:no-reply-ams@infor.com'
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const messages = res.data.messages
    if(messages.length) {
      messages.forEach((message) => {
        // console.log(message)
        getMessageContent(auth, message.id)
      });
    } else {
      console.log('No messages found.')
    }
  });
}

function getMessageContent(auth, messageId) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: "full",
  }, (err, res) => {
    if (err) return console.log('getMessageContent ran into some issues ' + err);
    const content = res.data;
    if(content){
      // console.log(content.payload.body.data);
      parseMessageContent(content, messageId)
    } else {
      console.log('No message content')
    }
  })
}

function parseMessageContent(messageObj, messageId) {
  
  let planText = '';
  let res = []
  const {payload: { body : { data }}} = messageObj;
  const getYear = (messageObj) => {
    const {payload: { headers }} = messageObj
    let value = ''
    headers.forEach((ele) => {
      if(ele.name === "Subject"){
        value = ele.value
      }
    })
    return value.match(/\d{4}/g)
  }
  const yearRange = getYear(messageObj)
  
  // console.log(Buffer.from(data, 'base64').toString('ascii'))
  planText = Buffer.from(data, 'base64').toString('ascii')
  if(planText.includes("<")){
    res = [...emailhtmlParserV1(JSON.stringify(planText))];
  } else {
    emailhtmlParserV2(planText, messageId, yearRange);
  }
  // console.log(res)
}

function emailhtmlParserV1(string) {
  string = string.replace(/\r?\n|\r/g, "")

  let curWord = '';
  let collector = [];
  let keep = false
  for(let i = 0; i < string.length; i += 1){
    let chara = string[i]
    if(chara === "<"){
      if(curWord.length){
        collector.push(curWord)
      }
      curWord = ''
      keep = false
    } else if (chara === ">"){
      keep = true
    } else {
      if(keep && chara !== " "){
        curWord += chara;
      }
    }
  }

  collectorV1 = []
  collector.forEach((ele, index, arr) => {
    if((ele.includes("PM") || ele.includes("AM" )) && ele.includes("-")){
      collectorV1.push({
        date: arr[index-1],
        time: arr[index],
        role: arr[index+5],
      })
    }
  })

  console.log(collectorV1)
  return collectorV1
}

function emailhtmlParserV2(string, messageId, yearRange) {
  // console.log(string)
  let go1 = string.replace(/\r?\n|\r/g, " ").split(',')
  const filterCondition = (ele) => {
    if(!ele.includes("Off") && !ele.includes("OUTL") && ele !== "Sunday/Dimanche/Domingo"){
      return ele
    }
  }
  go1 = go1.filter(filterCondition)
  // console.log(go1)
  go1 = go1.map(ele=>ele.trim())
  go1 = go1.map(ele=>ele.replace(' - ','-'))
  const brShiftTransformer = (str) => {
    const arr = str.split(' ')
    const date = arr[0]
    const year = yearRange[0];
    if(date.slice(0,1)===1){
      year = yearRange[1]
    }
    return {
      date: `${date}/${year}`,
      time: arr[1].trim(),
      role: `${arr[3]} ${arr[4]}`,
    }
  }
  go1 = go1.map(brShiftTransformer)

  // console.log(messageId)
  console.log(go1)
  return go1
}