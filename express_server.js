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
    'user_id': req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

// page to input a new url  
app.get("/urls/new", (req, res) => {
  let templateVars = {
    'user_id': req.cookies["user_id"]
  };

  res.render("urls_new", templateVars);
});

// displays single url on its own page 
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    'user_id': req.cookies["user_id"]
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

// displays login page
app.get('/login', (req, res) => {
  let templateVars = {
    'user_id': req.cookies["user_id"]
  };
  res.render('login', templateVars)
});

// displays registration form page
app.get('/register', (req, res) => {
  let templateVars = {
    'user_id': req.cookies["user_id"]
  };

  res.render("registration", templateVars);
});

// handles login and assigns form submission inputs to a cookie 
app.post('/login', (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    res.status(403).send('Error 403: Please fill out both email and password fields')
  } else {
    let findEmail = Object.values(users).find(user => user.email === req.body.email);
    if (!findEmail || req.body.password !== findEmail.password) {
      res.status(403).send('Error 403: The email or password is incorrect')
    } else {
      res.cookie("user_id", findEmail);
      res.redirect(`/urls`);
    }
  }

});

// handles logout, clears cookies
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

// creates new user upon registration
app.post('/register', (req, res) => {

  let randomID = generateRandomString();

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Error 400: Please enter a email and a password');
  } else {
    let foundEmail = Object.values(users).find(user => user.email === req.body.email)
    if (!foundEmail) {
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: req.body.password
      }
      res.cookie("user_id", users[randomID]);
      res.redirect(`/urls`);
    } else {
      res.status(400).send("Error 400: Email already in use")
    }
  }

})

