const express = require("express");
const methodOverride = require('method-override');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, urlsForUser, fetchMyIP, checkVistors } = require('./helpers');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true })); // use the extended character set
app.use(cookieSession({
  name: 'session',
  secret: 'tinyapp'
}));
app.use(methodOverride('_method'));


// Databse of Users
const users = {};

// Database of URLs
const urlDatabase = {};

const uniqueVistors = [undefined];

const timesOfVists = { ID: [], time: [] }

// redirects to appropriate page based on if user is logged in
app.get("/", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

// renders urls_index.ejs
app.get("/urls", (req, res) => {
  if (req.session["user_id"] === undefined) {
    let templateVars = {
      user_id: undefined,
      urls: null,
    };
    res.render("urls_index", templateVars);
  } else {
    let templateVars = {
      user_id: req.session["user_id"],
      urls: urlsForUser(req.session["user_id"]['id'], urlDatabase),
    };
    res.render("urls_index", templateVars);
  }
});

// renders page to input a new url
app.get("/urls/new", (req, res) => {
  let user_id = req.session["user_id"];
  if (user_id) {
    let templateVars = {
      user_id: user_id,
      user: users[user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

// renders page to display single url on its own page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    visits: urlDatabase[req.params.shortURL]['visits'],
    uniqueVisits: checkVistors(uniqueVistors),
    visitTimes: timesOfVists,
  };

  if (req.session["user_id"] === undefined) {
    res.status(400).send('Error 400: Please login');
  } else if (urlDatabase[req.params.shortURL]['userID'] !== req.session['user_id']['id']) {
    res.status(400).send('Error 400: You do not own this URL');
  } else {
    templateVars['user_id'] = req.session["user_id"];
    templateVars['userID'] = req.session["user_id"]['id'];
    res.render("urls_show", templateVars);
  }
});

// upon clicking short URL link redirects short url to website page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  urlDatabase[req.params.shortURL]['visits'] += 1;

  if (!req.session['user_id']) {
    id = 1;
    fetchMyIP().then((body) => {
      const ip = JSON.parse(body).ip
      timesOfVists['ID'].push(ip)
      checkVistors(uniqueVistors, ip);
    });
  } else {
    timesOfVists['ID'].push(req.session['user_id']['id'])
    checkVistors(uniqueVistors, req.session['user_id']['id']);
  }
  let timezone = new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
  let date = new Date(timezone)
  timesOfVists['time'].push(date.toLocaleString());
  res.redirect(longURL);
});

// generates short URL and adds it to list of database of URLs
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  // let thelongURL = `http://${req.body.longURL}`;
  let thelongURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: thelongURL,
    userID: req.session['user_id']['id'],
    user_id: req.session['user_id'],
    visits: 0,
  };
  res.redirect(`/urls/${shortURL}`);
});

// actually takes in the input of edit url form to edit the url
app.put('/urls/:shortURL', (req, res) => {
  if (!req.session['user_id']) {
    res.redirect('/urls');
  } else if (urlDatabase[req.params.shortURL]['userID'] === req.session['user_id']['id']) {
    urlDatabase[req.params.shortURL]['longURL'] = `http://${req.body.longURL}`;
    res.redirect(`/urls`);
  } else {
    res.status(400).send('Error: You don\'t own this URL');
  }
});

// deletes url
app.delete('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL]['userID'] === req.session['user_id']['id']) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
});

// renders the login page
app.get('/login', (req, res) => {
  let templateVars = { user_id: req.session["user_id"] };
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    res.render('login', templateVars);
  }
});

// renders the registration form page
app.get('/register', (req, res) => {
  let templateVars = { user_id: req.session["user_id"] };
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    res.render('registration', templateVars);
  }

});

// handles login; assigns what is being submitted in form to a cookie
app.post('/login', (req, res) => {
  let findEmail = getUserByEmail(req.body.email, users);

  if (!req.body.email || !req.body.password) {
    res.status(403).send('Error 403: Please fill out both email and password fields');
  } else {
    if (!findEmail || !bcrypt.compareSync(req.body.password, findEmail['password'])) {
      res.status(403).send('Error 403: The email and/or password is incorrect');
    } else {
      req.session['user_id'] = findEmail;
      res.redirect(`/urls`);
    }
  }
});

// creates new user, adds user to user database
app.post('/register', (req, res) => {
  let randomID = generateRandomString();
  let hashedPW = bcrypt.hashSync(req.body.password, 10);
  let findEmail = getUserByEmail(req.body.email, users);

  if (!req.body.email || !req.body.password) {
    res.status(400).send('Error 400: Please enter a email and a password');
  } else {
    if (!findEmail) {
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: hashedPW
      };
      req.session['user_id'] = users[randomID];
      res.redirect(`/urls`);
    } else {
      res.status(400).send("Error 400: Email already in use");
    }
  }
});

// handles logout; clears cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
