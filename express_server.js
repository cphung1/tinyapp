const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

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

const users = {};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "sgq3y6": { longURL: "http://www.google.com", userID: "aJ48lW" }
};


const urlsForUser = (id) => {
  var userURLS = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key]["userID"] === id) {
      userURLS[key] = urlDatabase[key]
    }
  }
  return userURLS;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// sends data to urls_index.ejs
app.get("/urls", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    let templateVars = {
      'user_id': 'undefined',
      urls: null,
    }
    res.render("urls_index", templateVars);
  } else {

    templateVars = {
      'user_id': req.cookies["user_id"],
      urls: urlsForUser(req.cookies["user_id"]['id']),
    };
    res.render("urls_index", templateVars);
  }


});

// page to input a new url  
app.get("/urls/new", (req, res) => {
  let templateVars = {
    'user_id': req.cookies["user_id"]
  };

  if (!templateVars['user_id']) {
    res.redirect('/login')
  } else {
    res.render("urls_new", templateVars);
  }

});

// displays single url on its own page 
app.get("/urls/:shortURL", (req, res) => {

  if (req.cookies["user_id"] === undefined) {
    let templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL]['longURL'],
      'user_id': 'undefined'
    };
    res.render("urls_show", templateVars);
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[shortURL]['longURL'],
      'user_id': req.cookies["user_id"],
      userID: req.cookies["user_id"]['id']
    };
    res.render("urls_show", templateVars);
  }
});

// actually takes in the input of edit url form to edit the url
app.post('/urls/:shortURL', (req, res) => {
  if (urlDatabase[shortURL]['userID'] === req.body.id) {
    urlDatabase[shortURL]['longURL'] = `http://${req.body.longURL}`;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/urls');
  }
});

// adds new url to list of urls 
app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  thelongURL = `http://${req.body.longURL}`;
  urlDatabase[shortURL] = {
    longURL: thelongURL,
    userID: req.cookies['user_id']['id'],
    'user_id': req.cookies['user_id']
  }
  res.redirect(`/urls/${shortURL}`);
});

// redirects short url to website page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

// deletes items 
app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[shortURL]['userID'] === req.body.id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
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
    'user_id': req.cookies["user_id"],
  };

  res.render("registration", templateVars);
});

// handles login and assigns form submission inputs to a cookie 
app.post('/login', (req, res) => {

  // bcrypt.compareSync("pink-donkey-minotaur", hashedPassword);
  if (req.body.email === "" || req.body.password === "") {
    res.status(403).send('Error 403: Please fill out both email and password fields')
  } else {
    let findEmail = Object.values(users).find(user => user.email === req.body.email);
    if (!findEmail || !bcrypt.compareSync(req.body.password, findEmail.password)) {
      res.status(403).send('Error 403: The email and/or password is incorrect')
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
  let hashpassword = bcrypt.hashSync(req.body.password, 10);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Error 400: Please enter a email and a password');
  } else {
    let foundEmail = Object.values(users).find(user => user.email === req.body.email)
    if (!foundEmail) {
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: hashpassword
      }
      res.cookie("user_id", users[randomID]);
      res.redirect(`/urls`);
    } else {
      res.status(400).send("Error 400: Email already in use")
    }
  }

})

