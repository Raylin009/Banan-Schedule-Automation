const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';
const CREDE_PATH = 'gmailCredentials.json';

fs.readFile('gmailCredentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), getMessageList);
});

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

get_auth().then(console.log).catch(console.log)


function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
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
        console.log(message)
        // getMessageContent(auth, message.id)
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
      parseMessageContent(content)
    } else {
      console.log('No message content')
    }
  })
}

function parseMessageContent(messageObj) {
  let planText = '';
  let res = []
  const {payload: { body : { data }}} = messageObj;
  planText = Buffer.from(data, 'base64').toString('ascii')
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

  if(planText.includes("<")){
    res = [...emailhtmlParserV1(JSON.stringify(planText))];
  } else {
    res = [...emailhtmlParserV2(planText, yearRange)]
  }
  console.log(res)
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
      const date = arr[index-1].match(/\d{2,4}/g)
      // console.log(justDate)
      collectorV1.push({
        date: date.join('/'),
        time: arr[index],
        role: arr[index+5],
      })
    }
  })
  // console.log(collectorV1)
  return collectorV1
}

function emailhtmlParserV2(string, yearRange) {
  let go1 = string.replace(/\r?\n|\r/g, " ").split(',')
  const filterCondition = (ele) => {
    if(!ele.includes("Off") && !ele.includes("OUTL") && ele !== "Sunday/Dimanche/Domingo"){
      return ele
    }
  }
  go1 = go1.filter(filterCondition)
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
      role: arr[4],
    }
  }
  go1 = go1.map(brShiftTransformer)
  return go1
}