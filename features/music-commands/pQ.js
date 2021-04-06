// Priority queue module

const YouTube = require("simple-youtube-api");
const { ytTOKEN } = require("../../config.json");
const youtube = new YouTube(ytTOKEN);
const Discord = require("discord.js");

// adds song to the Up Next position in queue
module.exports = {
  async priorityQ(message, serverQueue) {
    try {
      const args = message.content.split(" ");
      const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
      const video = await youtube.getVideo(url);
      const song = {
        title: video.title,
        url: video.url,
        description: video.description,
        thumbnail: video.thumbnails.high.url,
        duration: video.duration,
      };
      serverQueue.songs.splice(1, 0, song);

      selectEmbed = new Discord.MessageEmbed()
        .setAuthor("Song has been prioritized:")
        .setTitle(`${song.title}`)
        .setURL(`${song.url}`)
        .setThumbnail(`${song.thumbnail}`)
        .setColor("#cc8bc7")
        .setDescription(`\`\`position in queue:\`\` Up Next`);

      return message.channel.send(selectEmbed);
    } catch {
      return message.channel.send(`Error in your submission`);
    }
  },
};
