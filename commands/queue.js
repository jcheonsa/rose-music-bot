// Queue Module

const Discord = require("discord.js");
const { prefix, version, build } = require("../config.json");

module.exports = {
  queue: (message, serverQueue) => {
    if (!serverQueue) {
      message.channel.send("There's nothing in queue right now!");
      return;
    }

    if (!serverQueue.songs[1]) {
      message.channel.send("Check my status to see what's playing!");
      return;
    }

    if (message.author.bot) return;

    const gEmbed = (start) => {
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

    message.channel.send(gEmbed(0)).then((message) => {
      if (serverQueue.length <= 10) return;
      message.react("➡️");
      const collector = message.createReactionCollector(
        (reaction, user) =>
          ["⬅️", "➡️"].includes(reaction.emoji.name) && !user.bot,
        {
          time: 60000,
        }
      );
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
