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

12.28.2020
How to seperat the two types:

opt1: make 2 api call, one to get all the weekly schedule email
                       one to get all the monthly schedule email
      con: * might take longer for 2 round trip
           * might be more expensive too
      pro: * there are clear sperateions, more organized
Opt2: make one call and loop through to array to speate them 
      con: * messier potentially
      pro: only one call might be faster
  note: the time tride of are probably negligible

Decision:
  use snippet becuase it is easier for now
  if I use suject then I have to look through the payload headers
  I thought about which would be more resilient for changes but if they change the email templates there is a big chance that my code would not work anyway.

Idea for implamentation:
  If there is a email that my code cann't read, the return the url to that email and or the email object for me to play with it.

The month long one snippet:
"Schedule Changes/Changements d&#39;horaire/Cambios de horario DATE/L&#39;DATE/LA FECHA SCHEDULE/LE PLANNING/EL HORARIO UPDATED/MIS À JOUR/ACTUALIZADO DEPARTMENT/DÉPARTEMENT/DEPARTAMENTO ACTIVITY/"

The week long one snippet:
Sunday/Dimanche/Domingo, 11/22 01:00PM - 10:00PM WRK OUT_SALES, 01049_OUTL, 01049_OUTL_SALES_FLOOR Monday/Lundi/Lunes, 11/23 Off/Congé/Inactivo Tuesday/Mardi/Martes, 11/24 Off/Congé/Inactivo Wednesday/

12.28.2020
tested speed for getting and parshing the email array in a loop and a map

loop is around 390 ms
map is around 450 ms

12.28.2020
shit, I need the date that email is sent too to see which email is the latest change

** Leason Learned **

You don't refind the app as you go

you need to run all the way through first to see all the problem so you can evaluate the sevarity of the issues. 

if you fix and refine as you go, you will spend a lot of time on something that becamse irrelivent later down the road.

12.28.2020
shit, what if you had a shift on a date then a schdule changes and you don't have the shift on that date no more

right now I am using the list of shift from gmail and see if they need to be added or updated. this will cause problem becuase it would not remove the shift that's taken away in the later changes

but if there is a shift that is taken away, I would want to be alerted for that

in fact, I would like to be alerted of any changes to my schudule

01.13.2021

1304: organize example data with test into a folder and see if that I can still run test with "npm run test"

01.17.2021

I need to have a grand plan. I need draw a plan for how each function is invoked it to. Step by step 

01.18.2021

Grand Plan: 

* Gmail Side 
This app will get the last X email from Ray's gmail sent by "no-reply-ams@infor.com"

It will parse the email depending on the email template

It will compile a master shift schedule with all the dates included in the emails regardless the email indicates there is shift for that day

It will indicate on the master shift schedule whether the user have shifts for the date range that the emails covered

* Calendar Side
It will takes in the master shift scheudule 

loop through all the dates

  get shift event for that date if any

  check if it matech the shift in the master schedule{
    if match
      do nothing
    if don't match{
      make changes to the calendare to match master shift schedule{
        if(master schulde have shift for that date){
          if(calendar have a shift on that date as well){
            modify the shift to match the master schedule
          }else if the calendar doesn't have the shift {
            add the shift from master shift schedule to calendar
          }
        } doesn't {
          alert user
          rm the shift
        }
      }
    }
    log update in the event description if the event exist
  }



