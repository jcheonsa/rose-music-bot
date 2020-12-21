const Discord = require('discord.js')
const { lastFM_api, lastFM_secret, lastFM_username, lastFM_pw } = require('../../../config.json')
const LastfmAPI = require('lastfmapi')

module.exports = {

    commands: ['lfmhistory', 'history', 'lfmh'],
    description: "Returns song history",
    maxArgs: 1,
    callback:
        (message) => {

            const args = message.content.split(" ");

            if (args[1]) {
                var toLookup = args[1]
            } else {
                var toLookup = "rosayy-music"
            }

            var lfm = new LastfmAPI({
                api_key: lastFM_api,
                secret: lastFM_secret,
            });

            lfm.user.getRecentTracks({
                user: toLookup,
                api_key: lastFM_api,
            }, function (err, history) {
                if (err) {
                    console.log(err + `Fetching history issue`)
                }
                console.log(history)

                var arr = [];
                var song = history.track;
                for (var i = 0; i < song.length; i++) {
                    arr.push(`\`\`${i + 1})\`\` [${song[i].name}](${song[i].url})`)
                }

                const gEmbed = (start) => {
                    const current = arr.slice(start, start + 10);
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(`Rosé-music-bot's Play history.`)
                        .setColor('RANDOM')
                        .setThumbnail("https://thumbs.gfycat.com/QuaintPotableGenet-max-1mb.gif")
                    current.forEach((song) => {
                        embed.addFields({
                            name: `\u200b`, value: `${song}`
                        })
                    })
                    return embed;
                }
                message.channel.send(gEmbed(0)).then((message) => {
                    if (song.length <= 10) return;
                    message.react("➡️");
                    const collector = message.createReactionCollector(
                        (reaction, user) =>
                            ["⬅️", "➡️"].includes(reaction.emoji.name) && !user.bot,
                        {
                            time: 60000,
                        }
                    );
                    let cIndex = 0;
                    collector.on("collect", (reaction) => {
                        message.reactions.removeAll().then(async () => {
                            reaction.emoji.name === "⬅️" ? (cIndex -= 10) : (cIndex += 10);
                            message.edit(gEmbed(cIndex));
                            if (cIndex !== 0) await message.react("⬅️");
                            if (cIndex + 10 < song.length) message.react("➡️");
                        });
                    });
                });

            })
        }
}