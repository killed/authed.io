"use strict";

// Libraries
const request = require("request");
const jwt = require("jsonwebtoken");

function authed(information) {
  this.id = information.id || "";
  this.token = information.token || "";
  this.secret = information.secret || "";
  this.userKey = information.userKey || "";
  this.appSession = null;
  this.userSession = null;
  if (!this.id) {
    throw new Error("Invalid application id");
  } else if (!this.token) {
    throw new Error("Invalid application token");
  } else if (!this.secret) {
    throw new Error("Invalid application secret");
  } else if (!this.userKey) {
    throw new Error("No userKey defined!");
  }
}

authed.prototype.authorize = function() {
  return new Promise((resolve, reject) => {
    request(
      {
        json: true,
        method: "POST",
        url: "https://api.authed.io/app/verify/" + this.id,
        body: {
          access: this.token
        }
      },
      function(error, response, body) {
        if (error) callback("Failed to authorize application.");

        if (response.statusCode == 200 && body) {
          this.appSession = body.session;
          resolve(body.session);
        } else if (response.statusCode == 401) reject("Invalid access token.");
        else if (response.statusCode == 500)
          reject(
            "An error has occured, please try again later or contact support."
          );
        else reject(body);
      }
    );
  });
};

authed.prototype.login = function(email, password, callback) {
  if (!email) {
    throw new Error("No email provided");
  } else if (!password) {
    throw new Error("No password provided");
  } else {
    this.authorize()
      .then(session => {
        request(
          {
            json: true,
            method: "POST",
            url: "https://api.authed.io/app/login",
            headers: {
              session: session
            },
            body: {
              email: email,
              password: password
            }
          },
          function(error, response, body) {
            if (error) return callback(error);

            if (response.statusCode == 200) {
              this.userSession = body.userSession;
              callback(body);
            } else if (response.statusCode == 500)
              callback("An error has occured");
            else callback(body);
          }
        );
      })
      .catch(console.error);
  }
};

authed.prototype.register = function(email, password, code, callback) {
  if (!email) {
    throw new Error("No email provided");
  } else if (!password) {
    throw new Error("No password provided");
  } else {
    let license = null;

    if (code && code.length >= 1) license += code;

    this.authorize().then(
      session => {
        request(
          {
            json: true,
            method: "POST",
            url: "https://api.authed.io/app/register",
            headers: {
              session: session
            },
            body: {
              email: email,
              password: password,
              licenseCode: code
            }
          },
          function(error, response, body) {
            if (error) return console.log(error);

            if (response.statusCode == 200) {
              callback(body);
            } else if (response.statusCode == 500)
              callback("An error has occured");
          }
        );
      },
      function(error) {
        callback(error);
      }
    );
  }
};

// If valid it will return the user object, if not it will throw a new error :)
authed.prototype.verifyUser = function(userSession, callback) {
  let decoded = userSession
    ? jwt.verify(userSession, this.userKey)
    : jwt.verify(this.userSession, this.userKey);
  return decoded;
};

authed.prototype.generateLicence = function(
  prefix,
  level,
  time,
  amount,
  callback
) {
  if (!prefix) prefix = null;
  else if (!level) {
    throw new Error("No level provided");
  } else if (time < 0 && !time) {
    throw new Error("Invalid time");
  } else if (!amount) {
    throw new Error("No amount of licenses provided");
  } else if (amount > 50) {
    throw new Error("Amount of licenses too high");
  } else {
    this.authorize().then(
      session => {
        request(
          {
            json: true,
            method: "POST",
            url: "https://api.authed.io/app/generate/license",
            headers: {
              session: session
            },
            body: {
              secret: this.secret,
              prefix: prefix,
              level: level,
              time: time,
              amount: amount
            }
          },
          function(error, response, body) {
            if (error) return console.log(error);

            if (response.statusCode == 200) {
              callback(body);
            } else if (response.statusCode == 500)
              callback("An error has occured");
          }
        );
      },
      function(error) {
        callback(error);
      }
    );
  }
};

module.exports = authed;