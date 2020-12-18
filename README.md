# Banan-Schedule-Automation
Automate banana schedule from my email to my calendar

I get banan republic email every week and I have to manually put it into my google calendar. then I realize "wait a minute, I can code". 

Objective:
Automate the process to add my Banana Republic work schedule to my calendar

Tasks
* get work schedule from my gmail
  * technical spike on gmail API
    * following steps from to get email
      https://developers.google.com/gmail/api/quickstart/nodejs
    
  * access gmail
  * find the right email
  * get thatemail
* parse work the email to google calendar format
* add it to google calendar

12.04.2020
We will need a server to make the API call to gmail and calendar. that is what server.js is for.

12.18.2020
This is how far I got: 
step 1 "npm i"
step 2 "node ." to run index.js
step 3 "the terminal would say "Authorize this app by visiting this url: https://... Enter the code from that page here: "
step 4 Go to the websire, Chrom would tell you not to be go ahead anyway
step 5 Get the code, base it in the terminal
step 6 It would generate token.json with and list all the token you have in the termnial
this is as far as I go for now



