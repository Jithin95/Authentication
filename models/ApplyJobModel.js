const mongoose = require('mongoose');

const { Schema } = mongoose;

const ApplyJobSchema = new Schema({
    jobId:String,
    appliedUser: [
        {
            userId:String,
            username:String,
            email:String
        }
    ],
});

mongoose.model('AppliedJobs', ApplyJobSchema);
