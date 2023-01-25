const { connectDB } = require('../db/connect');

//this has angered me greatly
const BlackListModel = require('../models/blacklistModel');
require('dotenv').config();

//call this to blacklist an email or @domain from the service
const blacklistEmail = async (email, domain) => {
  await connectDB(process.env.MONGO_URI);
  const blacklisted = new BlackListModel({ email, domain });
  blacklisted.save();
  // console.log(`blacklisted email:${email}/domain:${domain}`)
};
//call this to remove a blacklist for an email or @domain from the service
const whitelistEmail = async (email, domain) => {
  await connectDB(process.env.MONGO_URI);
  BlackListModel.findOneAndDelete({ email, domain });
  // console.log(`removed blacklist on email:${email}/domain:${domain}`)
};

//checks if email matches any blacklist
const checkEmail = async (email) => {
  try {
    if (email == undefined) {
      return false;
    }
    await connectDB(process.env.MONGO_URI);
    var checked =
      (await BlackListModel.findOne({ domain: email.split(/@/)[1] })) != null ||
      (await BlackListModel.findOne({ email })) != null;
    return checked;
  } catch (err) {
    return err;
  }
};

module.exports = { blacklistEmail, whitelistEmail, checkEmail };
