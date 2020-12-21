const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
};

const reqNum = {
    type: Number,
    default: 0
}

const lfmSchema = mongoose.Schema({
    userID: reqString,
    discord: reqString,
    username: reqString,
})

module.exports = mongoose.model("lastfm-users", lfmSchema)