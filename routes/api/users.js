const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const UserDetail = mongoose.model('UserDetail');

//POST new user route (optional, everyone has access)
router.post('/register', (req, res, next) => {
  const user = req.body;
  console.log("User "+ user);

  if(!user.email) {
    return res.status(422).json({
        status : false,
        msg: 'Email is required'
    });
  }

  if(!user.password) {
    return res.status(422).json({
        status : false,
        msg: 'Password is required'
    });
  }

  if (user.email || user.password) {
    console.log("If else");
    Users.findOne({email: user.email}, (err, dbuser)=> {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false,
          msg : "Email Already Exists"+err
        })
      } else {
        if (dbuser) {
            res.status(409).json({
              status: false,
              msg : "Email Already Exists"
            })
        } else {
          const finalUser = new Users(user);

          finalUser.setPassword(user.password);

          return finalUser.save()
            .then(() => res.json({ user: finalUser.toAuthJSON() }));
        }
      }
    })
  }
});

//POST login route (optional, everyone has access)
router.post('/login', (req, res, next) => {
  const user = req.body;
  console.log(user);

  if(!user.email) {
    return res.status(422).json({
        status : false,
        msg: 'Email is required'
    });
  }

  if(!user.password) {
    return res.status(422).json({
          status : false,
          msg: 'Password is required'
    });
  }
    console.log("Passport Authenticate");
  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {

    if(err) {
        console.log("Authenticare error");
      return next(err);
    }

    if(passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();
      return res.json(user.toAuthJSON() );
    }

    return res.status(400).send(info);
  })(req, res, next);
});

//Update Profile
router.post('/updateprofile', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  userDetail = new UserDetail(req.body)
  console.log("User Detail " + userDetail);

  Users.update({_id: id}, { other_details: userDetail}, (err, out) => {
      if (err) {
          res.status(500).json({msg : `Something went wrong ${err} `})
      } else {
          Users.update({_id:id}, {$set: {is_profile_updated: true}}, (err, out)=> {
              if (err) {

                      res.status(500).json({msg : `Something went wrong ${err} `})
              } else {

                  res.status(200).json({status : "success" , msg : "Profile updated"})
              }
          })
      }
  })
});

// GEt profile update status
router.get('/profilestatus', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return Users.find({_id: id}, 'is_profile_updated', function (err, user) {
      if(!user) {
        return res.sendStatus(400);
    } else {
        return res.json({ status  :"success", is_profile_updated: user[0].is_profile_updated });
    }
});
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});

module.exports = router;
