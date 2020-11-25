// Seeking Module

const ytdl = require("ytdl-core");

module.exports = {
  seek: (message, serverQueue, ms) => {
    var msR = ms.split(":"),
      msRm = +msR[0],
      msRs = +msR[1];
    msRmN = msRm * 60;
    msFinal = msRmN + msRs;
    if (Number.isInteger(msFinal)) {
      const stream = ytdl(serverQueue.songs[0].url, { filter: "audioonly" });
      const streamOptions = { seek: msFinal };
      serverQueue.connection.play(stream, streamOptions);
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
  },
};
