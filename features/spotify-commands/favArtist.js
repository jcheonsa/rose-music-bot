const spySchema = require('../../schemas/spotifySchema')
const mongoose = require('../../util/mongoose')
const Discord = require('discord.js')

module.exports.addFav = async (message, member, artistName, artistPage) => {
    return await mongoose().then(async (mongoose) => {
        try {

            const userData = await spySchema.updateOne({
                userID: member.id,
                discord: member.nickname,
            },
                {
                    $addToSet: {
                        favArtists: `[${artistName}](${artistPage})`
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );

            return message.channel.send(`💞 You liked **${artistName}**! 💞`)
        } finally {
            mongoose.connection.close();
        }
    })

}

module.exports.checkFav = async (message) => {
    return await mongoose().then(async (mongoose) => {
        try {
            const member = message.member
            const userData = await spySchema.findOne({
                userID: member.id,
            })

            var artists = [];

            for (var i = 0; i < userData.favArtists.length; i++) {
                artists.push(`${i + 1}) ${userData.favArtists[i]}`)
            }

            let embed = new Discord.MessageEmbed()
                .setTitle(`${member.nickname}'s Favorite Artists`)
                .setDescription(artists)
                .setThumbnail('https://i.imgur.com/iU07Xb8.png')
                .setFooter(`Rosé-music-bot`)

            message.channel.send(embed)
        } finally {
            mongoose.connection.close();
        }
    })
}