const getUserByEmail = function (email, database) {
  for (const user in database) {
    if (database[user]['email'] === email) {
      return database[user];
    }
  }
};

const generateRandomString = () => {
  let output = '';
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    output += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return output;
};


const urlsForUser = (id, database) => {
  var userURLS = {};
  for (const key in database) {
    if (database[key]["userID"] === id) {
      userURLS[key] = database[key];
    }
  }
  return userURLS;
};


module.exports = { getUserByEmail, generateRandomString, urlsForUser };