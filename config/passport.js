const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new LocalStrategy(
    function(email, password, done){
        User.findOne({email: email}, function (err, user){
           if(err) return done(err);
           if(!user) return done(null, false, {message: 'Email doesn\'t exist or is incorrect'});
           if (!user.validatePassword(password)) return done(null, false, {message: 'Password incorrect'});
           return done(null, user);
        });
    }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.HOST + "auth/google/callback"
}, function(accessToken, refreshToken, profile, callback){
    console.log(profile);

    User.findOneOrCreateByGoogle(profile, function(err, user){
        return callback(err, user);
    });
}));

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
}); 

passport.deserializeUser(function (id, cb) {
    User.findById(id, function (err, user) {
        cb(err, user);
    });
});

module.exports = passport;