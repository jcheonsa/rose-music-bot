const Discord = require('discord.js')
const Genius = require('genius-lyrics');
const { genius_api, prefix } = require('../../config.json')
const gClient = new Genius.Client(genius_api);

module.exports.lyrics = async (message, serverQueue) => {

    try {

        var toLookup = message.content.replace(`${prefix}lyrics`, ``)

        const searches = await gClient.songs.search(toLookup);

        const firstSong = searches[0];
        console.log("About the song: \n", firstSong, "\n");

        const lyrics = await firstSong.lyrics();

        let embed = new Discord.MessageEmbed()
            .setTitle(`Lyrics for ${firstSong.artist.name}'s ${firstSong.title}`)
            .setThumbnail(firstSong.thumbnail)
            .setColor("RANDOM")
            .setFooter(`Rosé-bot (ft. genius-api)`)
            .setDescription(`\`\`\`${lyrics}\`\`\``, {
                split: {
                    prepend: '...',
                    append: '...'
                }
            })

        message.channel.send(embed)
    }
    catch (e) {
        message.channel.send("Something went wrong.")
    }
}