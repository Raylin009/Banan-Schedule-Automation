const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';
const CREDE_PATH = 'gmailCredentials.json';

const read_credential = (path) => {
  return new Promise ((resolve, reject) => {
    fs.readFile(path, (err, content) => {
      if(err) {
        reject(err)
        return
      };
      resolve(JSON.parse(content))
    })
  })
}
/**
read_token returns a promise with with parsed token
 */
const read_token = (path) => {
  return new Promise ((resolve, reject) => {
    fs.readFile(path, (err, content) => {
      if(err) { 
        reject(err)
        return
      };
      resolve(JSON.parse(content))
    })
  })
}
/*
getToken returns a promise with parsed token
*/
const getToken = async(oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const code = await new Promise ((resolve, reject) => {
    rl.question('Enter the code from that page here:' ,(code) => {
      rl.close();
      resolve(code);
    })
  })
  const token = await new Promise ((resolve, reject) => {
    oAuth2Client.getToken(code, (err, token) => {
      if(err) reject(`Error retrieveing access token ${err}`)
      resolve(token)
    })
  })
  return token
}

const write_token = (token_path, token) => {
  return new Promise ((resolve, reject) => {
    fs.writeFile(token_path, token, (err) => {
      if(err) {reject(err)}
      console.log('Token stored to', token_path)
      resolve(`path: ${token_path} \ntoken: ${token}`)
    })
  }) 
}

const generate_auth = async(crede_path, token_path) => {
  const credentials = await read_credential(crede_path);
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);
  let token = {};
  try {
    token = await read_token(token_path)
  } catch (err) {
    console.log('No token file yet')
    token = await getToken(oAuth2Client)
    write_token(token_path, JSON.stringify(token))
  } finally {
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }
}

const listLabels = async() => {
  const auth = await generate_auth(CREDE_PATH, TOKEN_PATH)
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

const getMessageList = async() => {
  const auth = await generate_auth(CREDE_PATH, TOKEN_PATH)
  const gmail = google.gmail({version: 'v1', auth});
  return new Promise ((resolve, reject) => {
    gmail.users.messages.list({
      userId: 'me',
      includeSpamTrash: false,
      labelIds: 'INBOX',
      maxResults: 10,
      q: 'from:no-reply-ams@infor.com'
    }, (err, res) => {
      if (err) return reject('The API returned an error: ' + err);
      const messages = res.data.messages
      resolve(messages)
      // if(messages.length) {
      //   messages.forEach((message) => {
      //     console.log(message)
      //   });
      // } else {
      //   console.log('No messages found.')
      // }
    });
  })
}

const getMessageContent = async(messageId) => {
  const auth = await generate_auth(CREDE_PATH, TOKEN_PATH)
  const gmail = google.gmail({version: 'v1', auth});
  return new Promise ((resolve, reject) => {
    gmail.users.messages.get({
        userId: "me",
        id: messageId,
    }, (err, res) => {
      if (err) return reject('getMessageContent ran into some issues ' + err);
      const content = res.data;
      resolve(content)
      // if(content){
      //   // console.log(content.payload.body.data);
      //   parseMessageContent(content)
      // } else {
      //   console.log('No message content')
      // }
    })
  })
}

const getScheduleYear = (messageObj) => {
  const {payload: {headers}} = messageObj;
  let value = '';
  headers.forEach((ele) => {
    if(ele.name === "Subject"){
      value = ele.value
    }
  })
  return value.match(/\d{4}/g)
}

//htmlParser
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
//plain text
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

const parseMessageContent = (messageObj) => {
  let planText = '';
  let res = [];
  const {payload: { body : { data }}} = messageObj;
  planText = Buffer.from(data, 'base64').toString('ascii')
  const yearRange = getScheduleYear(messageObj)
  if(messageObj.snippet.includes('Schedule Changes')){
    res = [...emailhtmlParserV1(JSON.stringify(planText))];
  }else if (messageObj.snippet.includes('Sunday/Dimanche/Domingo')){
    res = [...emailhtmlParserV2(planText, yearRange)]
  }
  return res
}

const initGmail = async() => {
  const auth = await generate_auth(CREDE_PATH, TOKEN_PATH)
  const gmail = google.gmail({version: 'v1', auth});
  return gmail
}

// const parse = (data) => {
//   const arr = parseMessageContent(data)
//   console.log(arr)
// }

// getMessageContent('175c4fc236fa7270').then(parse).catch((e) => (console.log('fuck', e)))
// getMessageContent('175d49ec2bb6430b').then(parse).catch((e) => (console.log('fuck', e)))

module.exports.getMessageList = getMessageList;
module.exports.getMessageContent = getMessageContent;
module.exports.parseMessageContent = parseMessageContent;
module.exports.initGmail = initGmail;



