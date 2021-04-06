// Seeking Module

const ytdl = require("ytdl-core");
const exe = require("./execute")

module.exports = {
  seek: (message, serverQueue, ms, client, queue) => {
    try {

      if (!serverQueue) {
        return message.channel.send("There is nothing in queue right now!")
      }

      var msR = ms.split(":"),
        msRm = +msR[0],
        msRs = +msR[1];
      msRmN = msRm * 60;
      msFinal = msRmN + msRs;
      if (Number.isInteger(msFinal)) {
        const stream = ytdl(serverQueue.songs[0].url, { filter: "audioonly" });
        const streamOptions = { seek: msFinal };
        serverQueue.connection.play(stream, streamOptions)
          .on("finish", () => {
            if (!serverQueue.loop) serverQueue.songs.shift();
            exe.play(message.guild, serverQueue.songs[0], client, queue);
          });
        message.channel.send(`Seeking to **${ms}**.`);
      } else {
        message.channel
          .send("Please follow the format - **MM:SS**")
          .then((message) =>
            message.delete({
              timeout: 10000,
            })
          );
      }
    } catch {
      message.channel.send(`Incorrect snytax: &seek **<MM:SS>**`)
    }
  },
};
