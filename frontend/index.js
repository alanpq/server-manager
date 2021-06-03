const fs = require("fs");
const path = require("path");

const express = require('express')
const app = express()
const port = process.env.PORT || 80

const flash = require('connect-flash');
const session = require("express-session");
const bodyParser = require("body-parser");

const users_path = path.join(__dirname, "users.json");

if (!fs.existsSync(users_path)) {
    fs.writeFileSync(users_path, "{}");
}

const users = JSON.parse(fs.readFileSync(users_path));

const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const save_user = (username, hash) => {
  users[username] = hash;
  fs.writeFile(users_path, JSON.stringify(users), () => {
  
  });
}

passport.use(new LocalStrategy(
  (username, password, done) => {
    if (users[username]) {
      bcrypt.compare(password, users[username], function (err, result) {
        if (err || !result) {
          return done(null, false, {message: 'Invalid username/password.'});
        } else {
          return done(null, {});
        }
      });
    } else {
      return done(null, false, {message: 'Invalid username/password.'});
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/*

bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    // Store hash in your password DB.
});

 */

app.set('view engine', 'pug')
app.use(express.static("static"))

app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
  if (Object.keys(users).length === 0) {
    res.redirect('init');
    return;
  }
  res.render('index', { messages: req.flash('error') })
})

app.get('/init', (req, res) => {
  res.render('init_creds', { messages: req.flash('error') });
})

app.post('/init', (req, res) => {
  if (Object.keys(users).length !== 0) {
    res.redirect('/');
    return;
  }
  bcrypt.hash(req.body.password, SALT_ROUNDS, function(err, hash) {
    if (err) {
      res.flash('error', 'Could not save user.');
      res.redirect('/init');
      return;
    }
    save_user(req.body.username, hash);
    res.redirect('/');
  });
})

app.get('/manager', (req, res) => {
  res.render('manager')
});

app.post('/',
  passport.authenticate('local', { successRedirect: '/manager',
    failureRedirect: '/',
    failureFlash: true })
);

app.listen(port, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`)
})