const fs = require('fs');
const readline = require('readline');
const {google, calendar_v3} = require('googleapis');
const { resolveCname } = require('dns');
const { credentials } = require('./calendarCredentials');
const { stringify } = require('querystring');
const { resolve } = require('path');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'calendarToken.json';

const read_credential = (path) => {
  return new Promise ((resolve, reject) => {
    fs.readFile(path, (err, content) => {
      if(err) { reject(err)};
      resolve(JSON.parse(content))
    })
  })
}
//credential path => "calendarCredentials.json"

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

  // return rl.question('Enter the code from that page here: ', (code) => {
  //   rl.close();
  //   oAuth2Client.getToken(code, (err, token) => {
  //     if(err) {console.log(`Error retrieveing access token ${err}`)}
  //     return token;
  //   })
  // })
}

const write_token = (token_path, token) => {
  return new Promise ((resolve, reject) => {
    fs.writeFile(token_path, token, (err) => {
      if(err) {reject(err)}
      console.log('Token stored to', TOKEN_PATH)
      resolve(`path: ${token_path} \ntoken: ${token}`)
    })
  }) 
}

const create_auth = async(credentials, token_path) => {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);
  let token = {};
  try {
    token = await read_token(token_path)
  } catch (err) {
    console.log('No token file yet')
    token = await getToken(oAuth2Client)
    // console.log(token)
    write_token(token_path, JSON.stringify(token))
    // console.log(`fuuuck ${err}`)
  } finally {
    // console.log(token)
    // oAuth2Client.setCredentials(token);
    // return oAuth2Client;
  }
}

read_credential('calendarCredentials.json')
.then((cred) => {
  return create_auth(cred, TOKEN_PATH)
})
.then(console.log)
.catch(console.log)




// fs.readFile('calendarCredentials.json', (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   authorize(JSON.parse(content), getCalendarListId);
// });

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
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
