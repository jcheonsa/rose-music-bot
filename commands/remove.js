// Remove song module

const { prefix } = require("../config.json");

module.exports = {
  removeSong: (message, array) => {
    const rm = message.content.split(" ");
    try {
      if (Number.isInteger(+rm[1])) {
        let removed = array.splice(rm[1], 1);
        let rmSong = rm[1];
        removed;
        message.channel.send(
          `**${rmSong}) ${removed[0].title}** has been removed from queue!`
        );
      } else {
        message.channel
          .send("Invalid selection. Make sure its an integer.")
          .then((message) =>
            message.delete({
              timeout: 5000,
            })
          );
        return;
      }
    } catch (e) {
      message.channel.send(
        `Queue might be broken, use **${prefix}restore** to repair.`
      );
    }
  },
};
