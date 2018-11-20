const mongoose = require('mongoose');

const { Schema } = mongoose;

const JobsSchema = new Schema({
    jobheading:String,
    expreience:String,
    keyskills:String,
    jobDescription:String,
    salarypackage : String,
    lastUpdated: { type: Date, default: Date.now },
    userId: String
});


JobsSchema.methods.setUserId = function(userid) {
  this.userId = userid;
};


mongoose.model('Jobs', JobsSchema);
