// Resume & Pause

module.exports = {
  resume: (message, serverQueue) => {
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return message.channel.send("Music resumed!");
    } else if (!serverQueue) {
      message.channel.send("There is nothing playing.");
      return;
    }
    return message.channel
      .send("Music is already playing.")
      .then((message) =>
        message.delete({
          timeout: 6000,
        })
      )
      .catch();
  },

  pause: (message, serverQueue) => {
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause();
      return message.channel.send("Music paused.");
    }
    message.channel
      .send("There is nothing playing.")
      .then((message) =>
        message.delete({
          timeout: 6000,
        })
      )
      .catch();
    return;
  },
};
