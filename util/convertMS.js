// time formatter

module.exports = {
  convertMS: (message, serverQueue, ms) => {
    if (!serverQueue) {
      return message.channel.send("There is nothing playing right now!");
    } else {
      var min = Math.floor(ms / 60000);
      var sec = ((ms % 60000) / 1000).toFixed(0);

      if (sec.toString().length == 1) {
        sec = "0" + sec;
      }

      let sD = serverQueue.songs[0].duration;
      let sDm = sD.minutes;
      let sDs = sD.seconds;
      if (sDs.toString().length == 1) {
        sDs = "0" + sDs;
      }

      return message.channel.send(
        `**Now Playing -** ${serverQueue.songs[0].title} - **${
          min + ":" + sec
        } / ${sDm}:${sDs}**`
      );
    }
  },
};
