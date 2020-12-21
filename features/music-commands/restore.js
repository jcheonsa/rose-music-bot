// Restore module

const exe = require("./execute.js");

module.exports = {
  restore: (message, client, queue, serverQueue) => {
    // try {
    //   serverQueue.songs.shift();
    //   message.channel
    //     .send("Restarting...")
    //     .then((message) => {
    //       setTimeout(function () {
    //         message.edit("I should be back up now!");
    //       }, 4000);
    //     })
    //     .then(exe.play(message.guild, serverQueue.songs[0], client, queue));
    // } catch (e) {
    //message.channel.send(e);
    queue.clear();
    message.channel.send("Restarting...").then((message) => {
      setTimeout(function () {
        message.edit("I should be back up now!");
      }, 4000);
    });
    // }
  },
};
