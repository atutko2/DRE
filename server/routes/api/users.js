const User = require('../../models/User');
const Author = require('../../models/Author');
const validateInput = require('../../shared/validations/SignUp');
// const Validator = require('validator');
// const isEmpty = require('lodash/isEmpty');

module.exports = (app) => {
  app.post('/api/account/search', (req, res, next) => {
    const { body } = req;
    const { email, additionalEmails, usernames, fname, lname } = body;
    const { final, isValid } = validateInput(body, 'authors');
    let query = final.join(' ');
    console.log(query)
    Author.find({$text: { $search: 
      query
    }})
    .exec()
    .then((author) => {
      res.json(author);
    })
    .catch((err) => next(err));
  })
  /*
   * Sign up
   */
  app.post('/api/account/signup', (req, res, next) => {
    const { errors, isValid } = validateInput(req.body, 'signup');
    if (!isValid) {
      errors.success = false;
      return res.send(errors);
    }
    const { body } = req;
    const { password } = body;
    let { email } = body;
    email = email.toLowerCase();
    email = email.trim();
    // Steps:
    // 1. Verify email doesn't exist
    // 2. Save
    User.find({
      email: email
    }, (err, previousUsers) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      } else if (previousUsers.length > 0) {
        return res.send({
          success: false,
          message: 'Error: Account already exist.'
        });
      }
      // Save the new user
      const newUser = new User();
      newUser.email = email;
      newUser.password = newUser.generateHash(password);
      newUser.save((err, user) => {
        if (err) {
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        return res.send({
          success: true,
          message: 'Signed up'
        });
      });
    });
  }); // end of sign up endpoint
};