const Discord = require('discord.js')
const {lastFM_api, lastFM_secret, lastFM_username, lastFM_pw} = require('../../config.json')
var scribble = require('scribble')
var Scrobbler = new scribble(lastFM_api, lastFM_secret, lastFM_username, lastFM_pw);

module.exports = {

    love: (message, serverQueue) => {

        const member = message.member
        const args = message.content.split(' ')

        // console.log(serverQueue.songs[0])

        var song = {
            artist: 'Bol4',
            track: 'Workaholic',
        }

        Scrobbler.Love(song)

        // console.log(serverQueue)

    }
}
