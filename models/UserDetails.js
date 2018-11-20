const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserDetailSchema = new Schema({
      mobile : String,
      profile_skills : [String],
      high_qualification : String,
      resume : String,

      c_name : String,
      c_email: String,
      designation: String,
      c_address : String,
      c_location : String,
      c_description : String
});


mongoose.model('UserDetail', UserDetailSchema);
