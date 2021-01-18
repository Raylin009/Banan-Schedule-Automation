const { getMessageContent } = require("./gmailAPIv2");



/**
 getEmailMetaInfo
  Input: Bana Republic Shift Schedule Email Object either in HTML or Plan Text Template
  output: {
    Email_Id,
    From,
    Subject,
    Date revieced,
    Content-Type:
      "text/html; charset=ISO-8859-1" (monthly)
      "text/plain; charset=UTF-8" (weekly)
  }
 */
const getEmailMetaInfo = (emailObj) => {
  let metaData = {};
  
  return metaData
};
/**
  emailParser_base64
    Input: email content body, base64 string
    output: email content
 */
const emailParser_base64 = (base64Code) => {
  return Buffer.from(base64Code, 'base64').toString('ascii')
};
/**
  emailContnetParser_htmlTemplate
    Input: email content with HTML template, string
    output: [
      { stDate,
        stTime,
        endDate,
        endTime,
        acitivity,
        job,
        store,
        department,
      },....
    ]
 */
const emailContnetParser_htmlTemplate = (content) => {
  return content
};
/**
  emailContnetParser_planTextTemplate
    Input: email content with HTML template, string
    output: [
      { stDate,
        stTime,
        endDate,
        endTime,
        acitivity,
        job,
        store,
        department,
      },....
    ]
 */
const emailContnetParser_planTextTemplate = (content) => {
  return content
};

module.exports.getEmailMetaInfo = getEmailMetaInfo;
module.exports.emailParser_base64 = emailParser_base64;
module.exports.emailContnetParser_htmlTemplate = emailContnetParser_htmlTemplate;
module.exports.emailContnetParser_planTextTemplate = emailContnetParser_planTextTemplate


