const Discord = require('discord.js')
const lfmSchema = require('../../../schemas/lastFMSchema')
const config = require('../../../config.json')
const api_key = config.lastFM_api
const api_secret = config.lastFM_secret
const LastfmAPI = require('lastfmapi')
const mongoose = require('../../../util/mongoose')

module.exports = {

    commands: ['lfmtopartist', 'lfmtopa', 'lfmta'],
    minArgs: 0,
    maxArgs: 2,
    expectedArgs: `**<month-range><# of artists>**`,
    description: "Top Artists for users",
    callback: async (message) => {

        var lfm = new LastfmAPI({
            api_key: api_key,
            secret: api_secret
        });

        // var authURL = lfm.getAuthenticationUrl({
        //     cb: 'http://www.last.fm/api/auth/?api_key='
        // })

        const member = message.member
        const args = message.content.split(" ")
        await mongoose().then(async (mongoose) => {

            try {

                const userData = await lfmSchema.findOne({
                    userID: member.id
                })

                lfm.user.getTopArtists({
                    // user to search up
                    user: userData.username,
                    // can be 7day | 1month | 3month | 6month | 12month
                    period: (args[1] || '12month'),
                    // only get the top 20 
                    limit: (args[2] || 20),
                    api_key: api_key
                }, function (err, topArtists) {
                    if (err) {
                        console.log(err + `Fetching topA issue`)
                    }

                    var topEmbed = new Discord.MessageEmbed()
                        .setAuthor(`${member.nickname}'s Top Artists`)
                        .setColor('RANDOM')
                        .setThumbnail('https://i.imgur.com/iU07Xb8.png')

                    var arr = [];

                    try {
                        var artist = topArtists.artist
                        for (var rank = 0; rank < artist.length; rank++) {

                            arr.push(`\`\`${rank + 1})\`\` ${artist[rank].name} - \`\`${artist[rank].playcount} plays\`\``)

                        }
                        topEmbed.setDescription(arr)

                        message.channel.send(topEmbed)
                    } catch (e) {
                        console.log(e + ` forEach() error`)
                    }
                })
            } finally {
                mongoose.connection.close();
            }
        })

    }

}