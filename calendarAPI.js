const fs = require('fs');
const readline = require('readline');
const {google, calendar_v3} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'calendarToken.json';

fs.readFile('calendarCredentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), getCalendarListId);
});

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

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
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
    'dateTime': '2020-12-23T17:00:00-07:00',
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

function getCalendarListId (auth) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.calendarList.list({
    auth:auth,
    maxResults: 15,
    minAccessRole: "owner",
    showDeleted: false,
    showHidden: false,
  }, (err, res) => {
    if (err){
      console.log(err)
    }else{
      const brCalendarOBJ = findBRCalendar(res.data.items)
      // console.log(brCalendarOBJ)
      // addEvent(auth, brCalendarOBJ, event)
      // deleteEvent(auth, brCalendarOBJ.id,"94pc6l482pkub5hppc5b95kuag")
      getEventList(auth, brCalendarOBJ.id)
    }
  })
}

function findBRCalendar (arr) {
  const [brCalendar] = arr.filter((ele) => ele.description === 'Banana Republic Schedule')
  // console.log(brCalendar)
  return brCalendar
}

function addEvent (auth, calendarListId, event) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.insert({
    auth: auth,
    calendarId: calendarListId.id,
    resource: event,
  }, function(err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created: %s', event.data.htmlLink);
    console.log(event.data.id)
  });
}


function deleteEvent (auth, calendarId, eventId) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.delete({
    calendarId,
    eventId,
    sendNotifications: true
  }, function (err, res) {
    if (err) {console.log(err)}
    return res
  })
}

function getEventList (auth, calendarId) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId,
    singleEvents: true,
    // orderBy: "startTime",
    maxResults: 2,
    q: "google"
    // sorttorder: "descending"
  }, (err, res) => {
    if(err) {
      console.log(err)
    }
    const eventArr = res.data.items
    const pretty = eventArr.map((event) => {
      return {
        name: event.summary,
        date: event.start.dateTime,
        id: event.id
      }
    })
    console.log(pretty)
    // console.log(pretty.slice(pretty.length - 5, pretty.length))
  })
}
