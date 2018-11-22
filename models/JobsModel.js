const mongoose = require('mongoose');

const { Schema } = mongoose;

const JobsSchema = new Schema({
    jobheading:String,
    experience:String,
    keyskills:String,
    jobDescription:String,
    salarypackage : String,
    lastUpdated: { type: Date, default: Date.now },
    lastAppplyDate: Date,
    userInfo: Schema.Types.Mixed
});



JobsSchema.methods.setUserInfo = function(userInfo) {
  this.userInfo = userInfo;
};


mongoose.model('Jobs', JobsSchema);
