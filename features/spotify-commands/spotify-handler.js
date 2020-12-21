const Discord = require('discord.js');
const SpotifyWebApi = require('spotify-web-api-node');
const { spotify_ID, spotify_secret, prefix } = require('../../config.json')

const spotifyApi = new SpotifyWebApi({
    clientId: spotify_ID,
    clientSecret: spotify_secret,
});

module.exports = {

    async search(message) {
        const member = message.member
        const args = message.content.replace(`${prefix}sysearch`, ``)
        var toLookup = args

        if (!toLookup) {
            return (message.reply(`Incorrect syntax. Try ${prefix}sysearch **<artist-name>**`))
        }

        // Retrieve an access token
        spotifyApi
            .clientCredentialsGrant()
            .then(function (data) {
                // Set the access token on the API object so that it's used in all future requests
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.searchArtists(toLookup)
                    .then(function (data) {

                        var arr = [];
                        var artist = data.body.artists.items.slice(0, 10)
                        for (var i = 0; i < artist.length; i++) {
                            arr.push(`[Spotify Page](${artist[i].external_urls.spotify}) ` + ` - `)
                        }

                        var n = 1;
                        const current = artist
                        const embed = new Discord.MessageEmbed()
                            .setTitle(`Look Up Results.`)
                            .setFooter(`Rosé-bot (ft. spotify-api)`)
                            .setTimestamp()
                            .setAuthor(`Press the number to go to the Artist page.`)
                            .setColor('RANDOM')
                            .setThumbnail("https://thumbs.gfycat.com/QuaintPotableGenet-max-1mb.gif")
                        current.forEach((artist) => {
                            embed.addFields({
                                name: `${n++}) ` + `${artist.name}`,
                                value: `[Spotify Page](${artist.external_urls.spotify}) - **Followers:** ${artist.followers.total} - **Popularity:** ${artist.popularity}`
                            })

                        })
                        try {
                            message.channel.send(embed).then(async (message) => {
                                let filter = (m) => m.author.id === member.id;
                                let query = await message.channel.awaitMessages(filter, {
                                    max: 1,
                                    time: 30000,
                                    errors: ["time"]
                                }).catch(error => console.log(error))

                                let selected = artist[query.first().content - 1];
                                if (!selected) {
                                    return message.channel.send("Invalid selection.");
                                } else {
                                    var artistID = selected.id
                                    var artistName = selected.name
                                    var artistPopularity = selected.popularity
                                    var artistGenres = selected.genres
                                    var artistThumb = selected.images[0].url
                                    var artistFollowers = selected.followers.total
                                    var artistType = selected.type
                                    var artistPage = selected.external_urls.spotify

                                    artistDetails(message, member, artistID, artistName, artistPopularity, artistGenres, artistFollowers, artistType, artistThumb, artistPage)
                                }
                            });
                        } catch (e) {
                            console.log(e)
                        }
                    }, function (err) {
                        console.log(err);
                    });
            })

    }

}

async function artistDetails(message, member, artistID, artistName, artistPopularity, artistGenres, artistFollowers, artistType, artistThumb, artistPage) {
    try {
        // Retrieve an access token
        spotifyApi
            .clientCredentialsGrant()
            .then(function (data) {
                // Set the access token on the API object so that it's used in all future requests
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.getArtistAlbums(artistID, { limit: 8 })
                    .then(function (data) {

                        var arr = [];
                        var artist = data.body
                        var albums = artist.items

                        for (var i = 0; i < albums.length; i++) {
                            arr.push(`\`\`${albums[i].release_date}:\`\` [${albums[i].name}](${albums[i].external_urls.spotify})  `)
                        }

                        var artistEmbed = new Discord.MessageEmbed()
                            .setFooter(` ${artistGenres.join(', ')} ` + ` ${artistType} ` + ` Rosé-bot (ft. spotify-api)`)
                            .setThumbnail(artistThumb)
                            .setTimestamp()
                            .addFields(
                                {
                                    name: `\`\`\`💽-Albums\`\`\``, value: arr
                                },
                                {
                                    name: `\u200b`, value: `**${artistName}'s** ` + `[Spotify page](${artistPage})`
                                },
                                {
                                    name: `\u200b`, value: `\`\`\`👪- ${artistFollowers}\`\`\``, inline: true
                                },
                                {
                                    name: `\u200b`, value: `\`\`\`👍- ${artistPopularity}\`\`\``, inline: true
                                },

                            )

                        spotifyApi.getArtistTopTracks(artistID, "US")
                            .then(async function (tData) {
                                var tracksArr = [];
                                var topSongs = tData.body
                                var tracks = topSongs.tracks

                                for (var t = 0; t < tracks.length; t++) {
                                    tracksArr.push(`${t + 1}) [${tracks[t].name}](${tracks[t].external_urls.spotify})\n`)
                                }


                                artistEmbed.setDescription(`\`\`\`${artistName}\`\`\`` + `\`\`🎶-Top Tracks\`\` \n ${(tracksArr).join('')}`)
                                try {
                                    let confirm = await message.reply(artistEmbed)
                                    await confirm.react("✅")
                                    await confirm.react("❎")
                                    let reactionFilter = (reaction, user) =>
                                        user.id === member.id && !user.bot;
                                    let reaction = (
                                        await confirm.awaitReactions(reactionFilter, {
                                            max: 1,
                                            time: 30000,
                                            errors: ["time"],
                                        }).catch(error => console.log(error))
                                    ).first();

                                    if (reaction.emoji.name === "✅") {
                                        const favArtist = require('./favArtist')
                                        favArtist.addFav(message, member, artistName, artistPage)

                                    } else if (reaction.emoji.name === "❎") {
                                        return message.channel.send(`Bye bye!`)
                                    }

                                } catch (e) {
                                    console.log(e)
                                }
                            }, function (err) {
                                console.log(err)
                            })

                    }, function (err) {
                        console.log(err);
                    })


            })
    } catch (e) {
        console.log(e)
        message.channel.send("I couldn't connect to Spotify..")
    }
}