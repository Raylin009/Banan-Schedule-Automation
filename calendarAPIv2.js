const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'calendarToken.json';
const CREDE_PATH = 'calendarCredentials.json';

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
      console.log('Token stored to', TOKEN_PATH)
      resolve(`path: ${token_path} \ntoken: ${token}`)
    })
  }) 
}

const generate_auth = async(credentials, token_path) => {
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

const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate()-days)
  return d
};
// getBREventList returns <Promise> Array[event in BRCalender with in the past 7 days]
const getBREventList = async() => {
  const credential = await read_credential(CREDE_PATH);
  const auth = await generate_auth(credential, TOKEN_PATH);
  const BRCalendar = await getCalendarListId();
  const calendar = google.calendar({version: 'v3', auth});
  const aWeekAgo = daysAgo(7);
  return new Promise ((resolve, reject) => {
    calendar.events.list({
      calendarId: BRCalendar.id,
      timeMin: aWeekAgo.toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    },  (err, res) => {
      if (err) {
        reject(`the APT return an error: ${err}`)}
      const events = res.data.items;
      if (events.length) {
        console.log('upcoming 10 events:');
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          console.log(`${start} - ${event.summary} - ${event.id}`);
        });
        resolve(events);
      } else {
        console.log('No upcoming evvents found.');
        resolve([]);
      }
    })
  })
}

const findBRCalendar = (arr) =>  {
  const [brCalendar] = arr.filter((ele) => ele.description === 'Banana Republic Schedule')
  return brCalendar
}

const getCalendarListId = async() => {
  const credential = await read_credential(CREDE_PATH);
  const auth = await generate_auth(credential, TOKEN_PATH);
  const calendar = google.calendar({version: 'v3', auth});
  return new Promise((resolve, reject) => {
    calendar.calendarList.list({
      auth:auth,
      maxResults: 15,
      minAccessRole: "owner",
      showDeleted: false,
      showHidden: false,
    }, (err, res) => {
      if (err){
        reject(err)
      }else{
        const brCalendarOBJ = findBRCalendar(res.data.items)
        resolve(brCalendarOBJ)
      }
    })
  })
}

var event = {
  'summary': 'Google I/O 2015',
  'location': '800 Howard St., San Francisco, CA 94103',
  'description': 'A chance to hear more about Google\'s developer products.',
  'start': {
    'dateTime': '2020-12-26T09:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'end': {
    'dateTime': '2020-12-26T17:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'attendees': [
  ],
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10},
    ],
  },
};

const addEvent = async(event) => {
  const credential = await read_credential(CREDE_PATH);
  const auth = await generate_auth(credential, TOKEN_PATH);
  const RBCalendar = await getCalendarListId();
  const calendar = google.calendar({version: 'v3', auth});
  return new Promise((resolve, reject) => {
    calendar.events.insert({
      auth: auth,
      calendarId: RBCalendar.id,
      resource: event,
    }, (err, res) => {
      if (err) {
        reject('There was an error contacting the Calendar service: ' + err);
        return
      }
      console.log('Event created: %s', res.data.htmlLink);
      resolve(res.data.id)
    });
  })
}

const deleteEvent = async(eventId) => {
  const credential = await read_credential(CREDE_PATH);
  const auth = await generate_auth(credential, TOKEN_PATH);
  const BRCalendar = await getCalendarListId();
  const calendar = google.calendar({version: 'v3', auth})
  return new Promise ((resolve, reject) => {
    calendar.events.delete({
      calendarId: BRCalendar.id,
      eventId,
      sendNotifications: true
    }, function (err, res) {
      if (err) {
        reject(err)
        return
      }
      resolve(`deleted event with id: ${eventId}`)
    })
  })
}

//update event
const patch = async(event) => {
  const credential = await read_credential(CREDE_PATH);
  const auth = await generate_auth(credential, TOKEN_PATH);
  const BRCalendar = await getCalendarListId();
  const calendar = google.calendar({version: 'v3', auth});
  return new Promise ((resolve, reject) => {
    calendar.events.patch(event, (err, res) => {
      if (err) {
        reject(err)
        return
      }
      resolve(res)
    })
  })
}

const initCalendar = async() => {
  const credential = await read_credential(CREDE_PATH);
  const auth = await generate_auth(credential, TOKEN_PATH);
  const calendar = google.calendar({version: 'v3', auth});
  return calendar
}
// deleteEvent('df4904u830isf510r6hq7dmm8o')
// .then(console.log)
// .catch(console.log)

// getCalendarListId()
// .then(console.log)
// .catch(console.log)

module.exports.getBREventList = getBREventList;
module.exports.initCalendar = initCalendar;
