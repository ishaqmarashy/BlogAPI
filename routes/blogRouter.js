const express = require('express');
const router = express.Router();
const {passport} = require('./auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const debug= require('debug')('blogRouter');
const { v4: uuidv4 } = require('uuid');
const {User,Comment,Post} = require('../models/model');
const SECRET= process.env.SECRET||'secret_word';
const Verify=async (req,res,next)=>{
  let result;
  await passport.authenticate('jwt',(err,res)=>{
      result= res;
  })(req)
  if (result){
    res.locals.currentUser=result;
    return next();
  }
  else
    res.status(403).send({status:403,message:"Access forbidden, login is required"});
}

//sign-in
//Enable cross origin resource sharing(CORS) beyond this point
router.use(cors())
router.get('/',(req, res)=>{
  res.send({message:`Submit login credentials at / or sign up at /sign-up`})
})
//sign-in works 
router.post('/',async (req, res)=>{
  //todo find usesr and set a token
  const {username,password}=req.body;
  const user=await User.findOne({_id:req.body.username});
  if(username&&password&&user&&user._id&&user.password){
    bcrypt.compare(password,user.password, (error, result) => {
      if (result) {
        const token = jwt.sign({ username }, SECRET);
        debug(`${req.url} got post of username:${username} password:${password} db check passed`);
        return res.status(200).json({
            message: "Auth Passed",
            token
        })
      }else{
        debug(`${req.url} got post of username:${username} password:${password} db check passed but compare failed ${error?error.message:''}`);
        res.status(401).json({
          message: "Auth Failed"})
      }
    });}
  else {
    debug(`${req.url} got post of username:${username} password:${password} db check failed`);
    res.status(401).json({
      message: "Auth Failed"})
  }
});

//works
router.get('/sign-up',(req, res)=>{
  res.send({message:'post username and password here'});
});

//works
router.post("/sign-up",(req, res, next) => {
    //10=salt, salting a password means adding extra random characters to it, to protect against rainbow table and dictionary 
    const {password}=req.body;
    const _id=req.body.username;
    debug(`${req.url} got post of  _id:${_id} password:${password}`)
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err){
          debug(`${req.url} failed to hash _id:${_id} `);
          return next(err);
        }
        const user = new User({
          _id: _id,
          password: hashedPassword
        }).save(err => {
          if (err) {
            debug(`${req.url} failed to save _id:${_id} `);
            return next(err);
          }
          res.status(200).send({message: 'User created sucessfully'});
        });
});});

//checks if the user has logged in and set their JWT token redirects to root(login) if not
//verified pages beyond this point
router.use(Verify);

router.get("/post/:_id/comment/:id",async (req,res)=>{
  const {id}=req.params;
  const query=Comment.findOne({id});
  const result= await query;
  debug(`${req.url} got get`);
  res.status(200).send(result);
});

router.put("/post/:_id/comment",async (req,res)=>{
  const {postid,text,date}=req.body;
  const{currentUser}=res.locals;
  let nDate;
  if (date)
    nDate=new Date(date);
  else 
    nDate=new Date();
  const comment=new Comment({userid:currentUser,postid,text,date:nDate});
  await comment.save((error,results)=>{
    if(!error){
      debug('Succeeded to create comment');
      res.status(200).send(results);
    }
    else{
      debug('Failed to create comment');
      res.status(500).send({message: `Something went wrong in creating the comment, make sure userid(as jwt token), postid, title, text are filled`});
  }})
});

router.get("/post/:_id/comment",async (req,res)=>{
  const {_id}=req.params;
  const query=Comment.find({postid:_id});
  const result= await query;
  debug(`${req.url} got get`);
  res.status(200).send(result);
});

router.get("/post/:_id",async (req,res)=>{
  const {_id}=req.params;
  const query=Post.findOne({_id});
  const result= await query;
  debug(`${req.url} got get`);
  res.status(200).send(result);
});

router.get("/post",async (req,res)=>{
  const query=Post.find(req.query);
  const result= await query;
  debug(`${req.url} got get`);
  res.status(200).send(result);
});

router.get("/post",async (req,res)=>{
  const query=Post.find();
  const result= await query;
  debug(`${req.url} got post`);
  res.status(200).send(result);
});

router.put("/post",async (req,res)=>{
  const {title,text,date}= req.body;
  const{currentUser}=res.locals;
  let nDate;
  if (date)
    nDate=new Date(date);
  else 
    nDate=new Date();
  if (nDate.toDateString()==="Invalid Date")
    res.status(500).send({message: 'Date was malformed'});
  else{
      const post =new Post({_id:uuidv4(),userid:currentUser,title,text,date:nDate});
      await post.save((error,results)=>{
        if(!error){
          debug('Succeeded to create post');
          res.status(200).send(results);
        }
        else{
          debug('Failed to create post');
          res.status(500).send({message: `Something went wrong in creating the post, make sure userid, title, text are filled`});
}});}});
 




module.exports = router;