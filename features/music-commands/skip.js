// Skip module

const { prefix } = require("../../config.json");
const exe = require("./execute.js");

module.exports = {
  skip: (message, serverQueue, client, queue) => {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could skip!");
    try {
      //serverQueue.connection.dispatcher.end();
      //console.log(`a song was skipped`);
      serverQueue.songs
        .shift()
        .then(exe.play(message.guild, serverQueue.songs[0], client, queue));
    } catch (e) {
      // message.channel.send(
      //     `I'm having trouble skipping, use **${prefix}restore** to repair!`
      // );
      console.log("Song was skipped.");
    }
  },
};
