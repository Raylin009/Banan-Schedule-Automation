const { patch, initCalendar} = require("./calendarAPIv2.js");

const patchObj = {
  calendarId:"6n947friv82c7b80dfigkv5kso@group.calendar.google.com",
  eventId: "0mtoa6qjavufaiqvtee54udcag",  
  description: "fuck it around",
  summary: "fuck it around"
}

const options = {
  'url':"https://www.googleapis.com/calendar/v3/calendars/6n947friv82c7b80dfigkv5kso@group.calendar.google.com/events/8um4fnv74r4nu5l5b029cph480"
}

const tPatch = async() => {
  const gCal = await initCalendar();
  gCal.events.patch(patchObj,{method:"PATCH"})
  .then(console.log)
  .catch(console.log)
}

tPatch()