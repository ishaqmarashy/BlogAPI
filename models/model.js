const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;
const mongoDb =`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASS}@test-server.dduiwsv.mongodb.net/`;
const jwt = require('jsonwebtoken');
const debug=require('debug')('model');

Mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = Mongoose.connection;
db.on("error", ()=>debug("mongo connection error"));
const User = Mongoose.model(
    "User",
    new Schema({
      _id: { type: String, required: true },
      password: { type: String, required: true },
    })
  );
const Post = Mongoose.model(
    "Post",
    new Schema({
        _id: { type: String, required: false },
      userid: { type: String, required: true },
      title: { type: String, required: true },
      text: { type: String, required: true },
      date: { type: Date, required: true },
    })
  );
const Comment = Mongoose.model(
    "Comment",
    new Schema({
        userid: { type: String, required: true },
        postid: { type: String, required: true },
        text: { type: String, required: true },
        date: { type: Date, required: true },
        published: { type: Boolean , default:true},
    })
  );
module.exports ={Mongoose,User,Comment,Post};