// Search Module

const Discord = require("discord.js");
const search = require("youtube-search");
const { prefix, youtube_api } = require("../config.json");

const opts = {
  maxResults: 7,
  key: youtube_api,
  type: "video",
};

module.exports = {
  async search(message) {
    try {
      let searchembed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(
          "Please enter a search query. The more specific, the better!"
        )
        .setTitle("Youtube Search-API");
      let embedMsg = await message.channel.send(searchembed);
      let filter = (m) => m.author.id === message.author.id;
      let query = await message.channel.awaitMessages(filter, {
        max: 1,
        time: 30000,
      });
      let results = await search(query.first().content, opts);

      if (results) {
        let youtubeResults = results.results;
        let i = 0;
        let titles = youtubeResults.map((result) => {
          i++;
          return i + `)  ` + result.title;
        });
        console.log(titles);
        message.channel
          .send({
            embed: {
              title: "Select the song by typing it's number!",
              description: titles.join(`**\n**`),
              color: "RANDOM",
            },
          })
          .catch((err) => console.log(err));

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
        } // if user selected nothing, then cancel the search

        embedMsg = new Discord.MessageEmbed()
          .setAuthor("Added to the queue: ")
          .setTitle(`${selected.title}`)
          .setURL(`${selected.link}`)
          .setDescription(`${selected.description}`)
          .setThumbnail(`${selected.thumbnails.default.url}`)
          .setColor("RANDOM");

        message.channel.send(embedMsg);
        message.channel
          .send(`${prefix}p ` + `${selected.link}`)
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
    }
    return;
  },
};
