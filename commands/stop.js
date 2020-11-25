// Stop module

const { prefix } = require("../config.json");

module.exports = {
  stop: (message, serverQueue) => {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!serverQueue) return message.channel.send("Songs are stopped already!");
    try {
      serverQueue.songs = [];
      serverQueue.connection.dispatcher.end();
      console.log("the queue was stopped");
    } catch (e) {
      message.channel.send(
        `Queue might be broken, use **${prefix}restore** to repair.`
      );
    }
  },
};
