const request = require('request-promise-native');

// searches through userdatabase, if with email exists returns user
const getUserByEmail = function (email, database) {
  for (const user in database) {
    if (database[user]['email'] === email) {
      return database[user];
    }
  }
};

// generates a unique ID
const generateRandomString = () => {
  let output = '';
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    output += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return output;
};

// detects who URL belongs to
const urlsForUser = (id, database) => {
  let userURLS = {};
  for (const key in database) {
    if (database[key]["userID"] === id) {
      userURLS[key] = database[key];
    }
  }
  return userURLS;
};

// makes request and fetches ip address
const fetchMyIP = function () {
  return request('https://api.ipify.org?format=json')
}

// checks if vistior has already clicked link, if not add their id to list
const checkVistors = (arr, id) => {
  if (!arr.includes(id)) {
    arr.push(id)
  }
  return arr.length - 1;
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser, fetchMyIP, checkVistors };