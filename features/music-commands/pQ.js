// Priority queue module

const YouTube = require("simple-youtube-api");
const { ytTOKEN } = require("../../config.json");
const youtube = new YouTube(ytTOKEN);

module.exports = {
  async priorityQ(message, serverQueue) {
    try {
      const args = message.content.split(" ");
      const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
      const video = await youtube.getVideo(url);
      const song = {
        title: video.title,
        url: video.url,
        decription: video.description,
        duration: video.duration,
      };
      serverQueue.songs.splice(1, 0, song);
      return message.channel.send(`**${song.title}** has been prioritized!`);
    } catch {
      return message.channel.send(`Error in your submission`);
    }
  },
};
