// search for playlists using youtube-api

const Discord = require("discord.js");
const search = require('ytsr')
const { prefix } = require('../../config.json')

const opts = {
    limit: 10
}

module.exports = {

    commands: ['plsearch'],
    minArgs: 1,
    expectedArgs: `**<object to search up>**`,
    callback:

        async (message) => {

            message.channel.startTyping();

            const args = message.content.substring(10)
            const toLookup = args

            const filters1 = await search.getFilters(toLookup)
            const filter1 = filters1.get('Type').get('Playlist')
            const filters2 = await search.getFilters(filter1.url)
            const filter2 = filters2.get('Features').get('Live');

            let results = await search(filter1.url, opts);


            try {
                if (results) {
                    let youtubeResults = results.items;
                    let i = 0;
                    let titles = youtubeResults.map((result) => {
                        i++;
                        return `\`\`${i})\`\`` + `${result.title}` + `  \`\`${result.length} songs\`\``;
                    });

                    let searchEmbed = message.channel.send(
                        {
                            embed: {
                                title: "Select a playlist to add by typing it's number!",
                                description: titles.join(`**\n**`),
                                color: "#cc8bc7",
                                footer: "Rosé-bot (ft. youtube-api)"
                            },
                        }
                    )
                        .catch((err) => console.log(err))

                    let filter = (m) => m.author.id === message.author.id;
                    let query = await message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 45000,
                    });

                    let selected = youtubeResults[query.first().content - 1];

                    if (!selected) {
                        message.channel.send("Invalid selection." + " Search cancelled.");
                        console.log("search was cancelled");
                        return;
                    }

                    message.channel
                        .send(`${prefix}p ` + `${selected.url}`)
                        .then((message) =>
                            message.delete({
                                timeout: 100,
                            })
                        )
                        .catch();
                }
            } catch (e) {
                message.channel.send(e);
                message.channel.send("Search timed out").then((message) =>
                    message.delete({
                        timeout: 6000,
                    })
                );
            } finally {
                message.channel.stopTyping();
            }
        },
};