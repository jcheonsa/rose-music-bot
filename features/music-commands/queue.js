// check the queue

const Discord = require("discord.js");

module.exports = {
  queue: (message, serverQueue) => {
    // if a queue doesn't exist for your server
    if (!serverQueue) {
      message.channel.send("There's nothing in queue right now!");
      return;
    }

    if (message.author.bot) return;

    // generate an embed to display the queue
    const gEmbed = (start) => {

      // show songs from position 0 - 10
      const current = serverQueue.songs.slice(start, start + 10);
      const qEmbed = new Discord.MessageEmbed()
        .setAuthor(
          `Rosé-bot Songs ${start}-${start + 9} out of ${
            serverQueue.songs.length
          }`
        )
        .setColor("RANDOM")
        .setThumbnail(
          "https://thumbs.gfycat.com/QuaintPotableGenet-max-1mb.gif"
        )
        .setFooter(`Loop: ${serverQueue.loop ? "on" : "off"}`)
        .setTimestamp();
        
        // iterates over each song from 0 - 10 in the queue to get its duration, title, URL, etc.
      current.forEach((songs) => {
        let sD = songs.duration;
        let sDm = sD.minutes;
        let sDs = sD.seconds;
        if (sDs.toString().length == 1) {
          sDs = "0" + sDs;
        }
        qEmbed.addField(
          `\u200b`,
          `**${start++})** ` +
            `**[${songs.title}](${songs.url})**` +
            `  ${sDm}:${sDs}`
        );
      });
      qEmbed.addField(`\u200b`, `\u200b`);
      qEmbed.addField(
        "Now Playing:",
        `** [${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`
      );
      qEmbed.addField(
        "Up Next:",
        `**- [${serverQueue.songs[1].title}](${serverQueue.songs[1].url})**`
      );
      return qEmbed;
    };

    // send the embed of songs from position 0 - 10
    message.channel.send(gEmbed(0)).then((message) => {
      // if the queue is less than 10 songs long
      if (serverQueue.songs.length <= 10) return;
      message.react("➡️");
      
      // collect the reactions of users to allow them to check out the rest of the queue if over 10 songs in length
      const collector = message.createReactionCollector(
        (reaction, user) =>
          ["⬅️", "➡️"].includes(reaction.emoji.name) && !user.bot,
        {
          time: 60000,
        }
      );
      
      // let the current index equal 0, and start generating the embed from that position for the next 10 songs
      let cIndex = 0;
      collector.on("collect", (reaction) => {
        message.reactions.removeAll().then(async () => {
          reaction.emoji.name === "⬅️" ? (cIndex -= 10) : (cIndex += 10);
          message.edit(gEmbed(cIndex));
          if (cIndex !== 0) await message.react("⬅️");
          if (cIndex + 10 < serverQueue.songs.length) message.react("➡️");
        });
      });
    });
  },
};
