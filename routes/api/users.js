const mongoose = require('mongoose');
const passport = require('passport');

var multer = require('multer');
var path = require('path');

const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const UserDetail = mongoose.model('UserDetail');
const AddJob = mongoose.model('Jobs');

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

//Add Job
router.post('/addjob', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  addJob = new AddJob(req.body)

  console.log("User Detail " + addJob);
  console.log(id);
  Users.findOne({_id: id}, (err, dbuser)=> {
    if (err) {
      console.log(err);
      res.status(500).json({
        status: false,
        msg : err
      })
    } else {
      if (dbuser) {
          const finalUser = new Users(dbuser);
          addJob.setUserInfo(finalUser)
            addJob.save((err, out)=> {
                if (err) {
                    res.status(500).json({status: false, msg: "Server error "+ err})
                } else {
                    res.status(200).json({status: true, msg: "Job added successfully"});
                }
            })
      } else {
          res.status(401).json({status: false, msg: "Cannot find User"});
      }
    }
  })
});

//Add Job
router.post('/updatejob', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  const jobId = req.body.jobId
  addJob = new AddJob(req.body.job)

  console.log("User Detail " + addJob);
  console.log(id);
  Users.findOne({_id: id}, (err, dbuser)=> {
    if (err) {
      console.log(err);
      res.status(500).json({
        status: false,
        msg : err
      })
    } else {
      if (dbuser) {
          const finalUser = new Users(dbuser);

          var query = {'_id':jobId};
          addJob.setUserInfo(finalUser)
	addJob._id = jobId
            AddJob.findOneAndUpdate(query, addJob, function(err, doc){
                if (err) {
                    res.status(500).json({status: false, msg: "Server error "+ err})
                } else {
                    res.status(200).json({status: true, msg: "Job Updated successfully"});
                }
            });
      } else {
          res.status(401).json({status: false, msg: "Cannot find User"});
      }
    }
  })
});

//Delete Job
router.post('/deletejob', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  const jobId = req.body.jobId

    AddJob.findOne({_id: jobId}).remove((err, job)=> {
        if (err) {
            res.status(500).json({status: false, msg: "Server error "+ err})
        }  else {
            if (job) {
                res.status(200).json({status: true, msg: "Job Deleted Successfully"});
            } else {
                res.status(401).json({status: false, msg: "Cannot find jobs"});
            }
        }
    })
});

//Get single Job
router.post('/getjobdetail', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  const jobId = req.body.jobId

    AddJob.findOne({_id: jobId}, (err, job)=> {
        if (err) {
            res.status(500).json({status: false, msg: "Server error "+ err})
        }  else {
            if (job) {
                res.status(200).json({status: true, job: job});
            } else {
                res.status(401).json({status: false, msg: "Cannot find jobs"});
            }
        }
    })
});

// Get Jobs
router.post('/getjob', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  console.log(req.body);
  usertype = req.body.usertype
  console.log("Get Job Api "+ usertype);
  if (usertype == 'jobseeker') {
      console.log("Jobseeker jobs");
      AddJob.find({}, (err, jobs)=> {
        if (err) {
            res.status(500).json({status: false, msg: "Server error "+ err})
        }  else {
            if (jobs) {
                res.status(200).json({status: true, jobs: jobs});
            } else {
                res.status(401).json({status: false, msg: "Cannot find jobs"});
            }
        }
      })
  } else {
      console.log("Employer jobs");
      AddJob.find({'userInfo._id': mongoose.Types.ObjectId(id)}, (err, jobs)=> {
        if (err) {
            res.status(500).json({status: false, msg: "Server error "+ err})
        }  else {
            if (jobs) {
                res.status(200).json({status: true, jobs: jobs});
            } else {
                res.status(401).json({status: false, msg: "Cannot find jobs"});
            }
        }
      })
  }

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
router.get('/currentuserdetail', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      return res.json(user.userDetail() );
    });
});


// function checkFiletype(file, cb) {
//     const fileTypes = /.pdf|.doc|.docx|.odt/;
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     console.log(extname);
//     const mimetype = fileTypes.test(file.mimetype);
//     console.log(mimetype);
//     if (mimetype && extname) {
//         return cb(null);
//     } else {
//         cb("Error: File only");
//     }
// }

var getFields = multer();
//Update Profile
router.post('/uploadfile', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  fileName = ""
  file = req.files

  const storage = multer.diskStorage({
      destination : './public/uploads/',
      filename : (req, file, cb)=> {
          fileName = id+path.extname(file.originalname);
          cb(null, id+path.extname(file.originalname));
      }
  });

  const upload = multer({
      storage: storage,
      limits : {fileSize : 5000000}, // 5 mb
      // fileFilter : (req, file, cb)=> {
      //     checkFiletype(file, cb);
      // }
  }).single('fileField');


  upload(req, res, (err)=> {
      if(err) {
          console.log("Error "+err);
          res.status(500).json({status: false, msg : err});
      } else {
          res.send({msg : "success", status: true, filepath : fileName });
      }
  })


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
