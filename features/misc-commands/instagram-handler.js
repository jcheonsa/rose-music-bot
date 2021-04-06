// instagram api handler

const Discord = require('discord.js');
const Instagram = require('instagram-web-api')
const { instaUser, instaPW } = require('../../config.json')
const instaClient = new Instagram({ username: instaUser, password: instaPW });
const { prefix } = require('../../config.json')

module.exports = {
    searchUser: async (message, username) => {

        message.channel.startTyping();

        try {
            // get information of a public user or hashtag based on user input
            const insta = await instaClient.getPhotosByUsername({ username })
            const instaUser = await instaClient.getUserByUsername({ username })
            const instaHash = await instaClient.getPhotosByHashtag({ hashtag: `twice`, first: 20 })

            // query for different values like profile pic, bio, followers, likes, comments, posts, etc.
            var arr = [];
            var artist = insta.user
            var artistPics = artist.edge_owner_to_timeline_media.edges

            var artName = instaUser.username
            var artPP = instaUser.profile_pic_url
            var artBio = instaUser.biography
            var artFollow = instaUser.edge_followed_by.count
            var artFullName = instaUser.full_name
            var artFollowing = instaUser.edge_follow.count

            // push different api objects to an array
            for (var i = 0; i < artistPics.length; i++) {
                arr.push({
                    "img": artistPics[i].node.thumbnail_src,
                    "likes": artistPics[i].node.edge_media_preview_like.count,
                    "caption": artistPics[i].node.edge_media_to_caption.edges[0].node.text,
                    "comments": artistPics[i].node.edge_media_to_comment.count
                },
                )
            }

            // dispalay array as a Discord embed
            const gEmbed = (start) => {
                const current = arr.slice(start, start + 1);
                const cEmbed = new Discord.MessageEmbed()
                    .setTitle(`\`\`\`            i n s t a g r é m           \`\`\``)
                    .setColor('#cc8bc7')
                current.forEach((pics) => {
                    console.log(pics)
                    cEmbed.setImage(
                        pics.img
                    )
                    cEmbed.setDescription(`\`\`${artFullName}\`\`\n` + `\`\`Followers: ${artFollow} - Following: ${artFollowing}\`\`\n`)
                    cEmbed.addFields(
                        {
                            name: `\u200b`, value: `${pics.caption.substring(0, 200).concat("..")} \n`
                        },

                    )
                    cEmbed.setFooter(`❤️- ${pics.likes}     💬 - ${pics.comments}`)
                })
                return cEmbed
            };

            // allow reactions as a means for an interactable ui
            message.channel.send(gEmbed(0)).then(message => {
                if (arr.length <= 1) return;
                message.react('❤️');
                message.react('➡️');
                const collector = message.createReactionCollector(
                    (reaction, user) =>
                        ['⬅️', '➡️', '❤️'].includes(reaction.emoji.name) && !user.bot,
                    {
                        time: 60000
                    }
                );

                // depending on array index, add different reactions (arrows for navigating through the feed/array and liking photos)
                let currentIndex = 0;
                collector.on("collect", (reaction) => {
                    message.reactions.removeAll().then(async () => {
                        message.react('❤️');
                        reaction.emoji.name === "⬅️" ? (currentIndex -= 1) : (currentIndex += 1);
                        message.edit(gEmbed(currentIndex));
                        if (currentIndex !== 0) await message.react("⬅️");
                        if (currentIndex + 1 < arr.length) await message.react("➡️");

                    })
                    if (reaction.emoji.name === "❤️") {
                        message.channel.send("Liked the post!").then((message) =>
                            message.delete({
                                timeout: 2000,
                            }))
                    }
                })

            })

        } catch (err) {

            // if not yet logged in, run this
            const logEmbed = new Discord.MessageEmbed()
                .setTitle(`\`\`\`            i n s t a g r é m           \`\`\``)
                .setColor('#cc8bc7')
                .setDescription(`\`\`Logging into Instagram..\`\``)
                .setImage(`https://i.imgur.com/fCrA74w.png`)
                .setFooter(`Rosé-bot (ft. instagram-api)`)

            message.channel.send(logEmbed).then((message) => {
                setTimeout(function () {
                    module.exports.login(message, logEmbed)
                }, 5000);
            })

            return console.log(err)

        } finally {
            message.channel.stopTyping();
        }
    },

    // entirely the same for querying public accounts but for hashtags
    searchHashtag: async (message, tag) => {
        console.log(tag)
        message.channel.startTyping();

        try {

            // only get the top 20 results
            const instaHash = await instaClient.getPhotosByHashtag({ hashtag: `${tag}`, first: 20 })

            console.log(instaHash)

            var arr = [];
            var hashtags = instaHash.hashtag.edge_hashtag_to_top_posts.edges

            for (var i = 0; i < hashtags.length; i++) {
                arr.push({
                    "img": hashtags[i].node.thumbnail_src,
                    "likes": hashtags[i].node.edge_media_preview_like.count,
                    "caption": hashtags[i].node.edge_media_to_caption.edges[0].node.text,
                    "comments": hashtags[i].node.edge_media_to_comment.count
                },
                )
            }

            const gEmbed = (start) => {
                const current = arr.slice(start, start + 1);
                const cEmbed = new Discord.MessageEmbed()
                    .setTitle(`\`\`\`            i n s t a g r é m           \`\`\``)
                    .setColor('#cc8bc7')
                current.forEach((pics) => {
                    console.log(pics)
                    cEmbed.setImage(
                        pics.img
                    )
                    cEmbed.setDescription(`\`\`#${tag} feed\`\`\n`)
                    cEmbed.addFields(
                        {
                            name: `\u200b`, value: `${pics.caption.substring(0, 200).concat("..")} \n`
                        },

                    )
                    cEmbed.setFooter(`❤️- ${pics.likes}     💬 - ${pics.comments}`)
                })
                return cEmbed
            };

            message.channel.send(gEmbed(0)).then(message => {
                if (arr.length <= 1) return;
                message.react('❤️');
                message.react('➡️');
                const collector = message.createReactionCollector(
                    (reaction, user) =>
                        ['⬅️', '➡️', '❤️'].includes(reaction.emoji.name) && !user.bot,
                    {
                        time: 60000
                    }
                );

                let currentIndex = 0;
                collector.on("collect", (reaction) => {
                    message.reactions.removeAll().then(async () => {
                        message.react('❤️');
                        reaction.emoji.name === "⬅️" ? (currentIndex -= 1) : (currentIndex += 1);
                        message.edit(gEmbed(currentIndex));
                        if (currentIndex !== 0) await message.react("⬅️");
                        if (currentIndex + 1 < arr.length) await message.react("➡️");

                    })
                    if (reaction.emoji.name === "❤️") {
                        message.channel.send("Liked the post!").then((message) =>
                            message.delete({
                                timeout: 2000,
                            }))
                    }
                })

            })

        } catch (err) {

            const logEmbed = new Discord.MessageEmbed()
                .setTitle(`\`\`\`            i n s t a g r é m           \`\`\``)
                .setColor('#cc8bc7')
                .setDescription(`\`\`Logging into Instagram..\`\``)
                .setImage(`https://i.imgur.com/fCrA74w.png`)
                .setFooter(`Rosé-bot (ft. instagram-api)`, `https://i.imgur.com/ZEB8GJd.jpg`)

            message.channel.send(logEmbed).then((message) => {
                setTimeout(function () {
                    module.exports.login(message, logEmbed)
                }, 5000);
            })

            return message.channel.send(err)

        } finally {
            message.channel.stopTyping();
        }

    },

    login: async (message, logEmbed) => {

        logEmbed.setDescription(`\`\`Logged in - Go ahead and try again!\`\` \n \`\`Currently connected to: rosé-music-bot\`\``)
            .setImage('https://i.imgur.com/umE07Kk.jpg')

        await instaClient
            .login()
            .then(() => {
                instaClient
                    .getProfile()
                    .then(console.log)
                    .then(
                        message.edit(logEmbed
                        )
                    )

            });

        return
    }
}
