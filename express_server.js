const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true })); // use the extended character set 
app.use(cookieParser());
app.set('view engine', 'ejs');


const generateRandomString = () => {
  let output = '';
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    output += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return output;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// sends data to urls_index.ejs
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["users"]
  };
  res.render("urls_index", templateVars);
});

// page to input a new url  
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["users"]
  };

  res.render("urls_new", templateVars);
});

// displays single url on its own page 
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["users"]
  };
  res.render("urls_show", templateVars);
});

// actually takes in the input of edit url form to edit the url
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${shortURL}`);
});

// adds new url to list of urls 
app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${shortURL}`);
});

// redirects short url to website page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// deletes items 
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// when you hit edit button redirects to right page
app.post('/urls/:shortURL/edit', (req, res) => {
  shortURL = req.params.shortURL
  res.redirect(`/urls/${shortURL}`)
});

// renders login page
app.get('/login', (req, res) => {
  let templateVars = {
    username: req.cookies["users"]
  };
  res.render('login', templateVars)
});

// handles login and assigns form submission to a cookie 
app.post('/login', (req, res) => {

  for (let user in users) {
    if (users[user]['email'] === req.body.email && users[user]['password'] === req.body.password) {
      res.cookie("user_id", req.body.id);
      res.redirect(`/urls`);
    } else {
      res.status(403).send('Error: 403')
    }
  }

});

// handles logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

// displays registration form page
app.get('/register', (req, res) => {
  let templateVars = {
    username: req.cookies["users"]
  };
  res.render("registration", templateVars);
});

// creates new user upon registration
app.post('/register', (req, res) => {

  for (let user in users) {
    if (users[user]['email'] === req.body.email) {
      res.status(400).send('Error: 400');
    }
  }

  let randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  }

  if (users[randomID]['email'] === "" || users[randomID]['password'] === "") {
    res.status(400).send('Error: 400');
  }

  res.cookie("user_id", randomID);
  res.redirect(`/urls`);
})

