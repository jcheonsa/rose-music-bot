// Restore module

const exe = require("./execute.js");

module.exports = {
  restore: (message, client, queue, serverQueue) => {
    queue.clear();
    message.channel.send("Restarting...").then((message) => {
      setTimeout(function () {
        message.edit("I should be back up now!");
      }, 4000);
    });
  },
};
