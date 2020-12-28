const { getBREventList } = require('./calendarAPIv2.js');
const fs = require('fs');

// getBREventList()
// .then(console.log)
// .catch(console.log)

/*

get schedule from email

  * GET from: no-reply-ams@infor.com && a month ago
    catagory1:
      Subject has "Lin, Ray-Jhe, Work Schedule/Horaire de travail/Programa de trabajo,"
    catagory2:
      subject has "Schedule Change Alert/Alerte de changement d'horaire/Programar alerta de cambio"
    catagory3:
      alert me so I can take a look at it

  * CONSOLIDATE all the scheduled dates from the past month
    check if the date existes already
      if it does then check if the time are the same
        if time is the same then move on
        if time is different then replace the date with the latest one
      if the date doesnt exist
        add the date and time to the master schedule
    get rid of past events in the array
add to calender

  * get all the future events 

  * match with the master scheudle 
    if date exist biut time different, 
      patch
    if date deosnt exist
      add
  return a log of changes made
*/
const pTest = async(cb) => {
  fs.readFile('gmailCredentials.json', (err, content) => {
    if (err) return 'Error loading client secret file:'+ err
    return content
  })
}
const what = pTest()

console.log(what)




