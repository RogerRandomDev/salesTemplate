const { connectDB, process } = require('../db/connect');
const UserModel = require('../models/userModel');
const { hashString } = require('../middleware/hash');
const { sendConfirmationEmail } = require('../middleware/accountConfirmation');
const { checkToken } = require('./auth');

require('dotenv').config();

//returns the user database content
const getUser = async (userEmail) => {
  let output = null;
  try {
    await connectDB(process.env.MONGO_URI);
    
    output = await UserModel.findOne({ email: userEmail });
  } catch (err) {
    console.log(err);
  }
  return output;
};
const getUsers = async (userIDs) => {
  let users = null;
  try {
    await connectDB(process.env.MONGO_URI);
    // console.log(favorites);
    users = await UserModel.find(
      { _id: { $in: userIDs } },
      function (err, items) {
        if (err) users = err;
        if (items) users = items;
      }
    )
      .clone()
      .catch((err) => console.log(err));
  } catch (err) {
    console.log(err);
  }
  return users;
};

//returns user from database through the user id
const getUserByID = async (userID) => {
  var output = null;
  try {
    await connectDB(process.env.MONGO_URI);
    await (output = await UserModel.findById(userID));
  } catch (err) {
    console.log(err);
  }
  return output;
};

//Updates User Favorites
const updateUserFavorites = async (userID, favorites) => {
  let output = null;
  try {
    await connectDB(process.env.MONGO_URI);
    await UserModel.findByIdAndUpdate(
      userID,
      { favorites: favorites },
      function (err, docs) {
        if (err) {
          output = err;
        } else {
          output = docs;
        }
      }
    )
      .clone()
      .catch((err) => console.log(err));
  } catch (err) {
    console.log(err);
  }
  return output;
};

//creates a user and adds it to the database
const createUser = async (userData) => {
  userData = {
    email: userData.email,
    password: userData.password
  };
  
  var _id = null;
  try {
    await connectDB(process.env.MONGO_URI);
    userData.password = await hashString(userData.password);

    const newUser = new UserModel(userData);
    await newUser.save();
    /*if (await UserModel.findOne({ email: userData.email })) {
      return { success: false, msg: 'User already exists with email' };
    }

    userData.password = await hashString(userData.password);

    const newUser = new UserModel(userData);
    await newUser.save();*/
    _id = newUser._id;
  } catch (err) {
    console.log(err);
  }
  return { success: true, msg: 'User Created successfully', _id };
};
const deleteUser = async (req, res) => {
  const { token } = JSON.parse(req.body);
  const { userID, email } = decodeToken(token);
  if (!checkToken(token)) {
    return res.status(202).send({ success: false, msg: 'invalid user token' });
  }
  try {
    await connectDB(process.env.MONGO_URI);
    await UserModel.findByIdAndDelete(userID);
    return res
      .status(200)
      .send({ success: true, msg: 'User deleted successfully' });
  } catch (e) {}
  res.send({ success: false, msg: 'failed to delete user' });
};

const buildUserData = (req) => {
  const { email, password} =
    JSON.parse(req.body);
  return {
    email,
    password
  };
};

module.exports = {
  getUser,
  getUsers,
  getUserByID,
  createUser,
  buildUserData,
  deleteUser
};

