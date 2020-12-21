const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
};

const reqNum = {
    type: Number,
    default: 0
}

const spySchema = mongoose.Schema({
    userID: reqString,
    discord: reqString,
    favArtists: {
        type: [],
        required: true,
    }
});

module.exports = mongoose.model("spotify-faves", spySchema);