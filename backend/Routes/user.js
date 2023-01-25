const express = require('express');
const cors = require('cors');
const {login,logout,updateToken,checkToken,} = require('../controllers/auth');
const {getUser,getUserByID,createUser,buildUserData, getUsers,} = require('../controllers/user');
const router=express.Router();


//logs in user if valid password/email provided, and provides temp token for them to use to validate themselves
router.post("/login",async (req,res)=>{
    const userData=JSON.parse(req.body);
    
    var checkUser = await getUser(userData.email);
    var log = await login(userData, checkUser);

    return await res.status(200).send(log);
})

//logs user out of server
router.post("/logout",async (req,res)=>{
    await logout(req, res);
})

//checks the return token if it is a valid token for account authentication and then creates account if it is
router.post("/confirmAccount",async (req,res)=>{
    var userData = await recieveConfirmationToken(req, res);
    if(!userData.success) return res.status(200).send({success:false});
    userData=userData.decoded;
    
    const newUser = await createUser(userData);
    if(!newUser.success) return res.send(newUser);

    var ID=newUser._id;
    res.send({success:true,msg:'account authenticated', _id:ID})

})


module.exports = router