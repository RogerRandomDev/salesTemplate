const jsonwebtoken = require("jsonwebtoken");
const { sendEmail } = require("../controllers/emails")
const JWT_SECRET = "ASEDsano17sdskan216754dio_peuba64ifuwiqaso832jdehifncmaofi522351'112Hda"
const { createUser, getUser } = require("../controllers/User");
const { checkEmail } = require("../controllers/blacklist")
const fs = require("fs");
const timers = require("timers");
let emailForm = fs.readFileSync(__dirname + "/../interface/emailForm.html", 'utf-8');
var confirmationTokens = []
//sends an activation email for the user to their email address
const sendConfirmationEmail = async (userData) => {
  if (await checkEmail(userData.email)) return { success: false, msg: "email/domain blacklisted" }
  //userData.businessData.BannerLink=await storeImage(userData.businessData.BannerLink)
  var confirmationToken = await jsonwebtoken.sign(userData, JWT_SECRET)
  timers.setTimeout(() => confirmationTokens = confirmationTokens.filter((tok) => tok != token), 1800000)
  confirmationTokens.push(confirmationToken);
  // let replaceValue = `<input type='hidden' value='${String(confirmationToken)}' name='token'>
  // <button type='submit'>Authenticate Account</button>`
  emailForm = emailForm.replace("{FORM_REPLACE}", String(confirmationToken));

  sendEmail(userData.email, "Account Confirmation", emailForm);
  return { success: true, msg: "Sent account authentication email" }
}


const recieveConfirmationToken = async (req, res) => {
  // var {token}=req.query
  // let regex=  /confirmAccount\/(.+)/;
  // let token = req.originalUrl.match(regex)[1];
  // console.log(token, "29");
  // console.log(req.params);
  // console.log(req.body);
  let token = req.body.split("=")[1].split("\r\n")[0];

  if (!confirmationTokens.includes(token)) { return { success: false, msg: "invalid token" } }
  var decoded = await jsonwebtoken.decode(token)

  var tokenData = decoded
  confirmationTokens = confirmationTokens.filter((tok) => tok != token)
  return { success: true, decoded, msg: "account authenticated", tokenData }
  // req.body.token = tokenData;
  // next();
}

module.exports = { sendConfirmationEmail, recieveConfirmationToken }