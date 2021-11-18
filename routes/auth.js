const passport=require('passport');
const debug=require('debug')('auth');
const JwtStrategy=require('passport-jwt').Strategy;
const ExtractJwt=require('passport-jwt').ExtractJwt;
const opt={
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:process.env.SECRET||'secret_word'
}

passport.use(new JwtStrategy(opt,(jwt_payload, done) => {
  const {username}=jwt_payload;
  if(typeof username!=='undefined'){
    debug(`Username:${username} auth succeeded`);
    return done(null,username);
  }else{
    debug(`Username:${username} auth failed`);
    return done(null,false)
  }
}));


  module.exports = {passport};