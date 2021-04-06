// Queue Module

const Discord = require("discord.js");
const { prefix, version, build } = require("../../config.json");

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

    console.log(serverQueue)

    const gEmbed = (start) => {
      const current = serverQueue.songs.slice(start, start + 10);
      const qEmbed = new Discord.MessageEmbed()
        .setColor("#cc8bc7")
        .setThumbnail(
          "https://thumbs.gfycat.com/QuaintPotableGenet-max-1mb.gif"
        )
        .setFooter(`Loop: ${serverQueue.loop ? "on" : "off"}`)
        .setTimestamp();

      if (serverQueue.songs.length <= 10) {
        qEmbed.setAuthor(
          `Rosé-bot Songs ${start + 1}-${serverQueue.songs.length} out of ${serverQueue.songs.length
          }`
        )
      } else {
        qEmbed.setAuthor(
          `Rosé-bot Songs ${start + 1}-${start + 10} out of ${serverQueue.songs.length
          }`
        )
      }

      let position = (start + 1)
      let arr = [];
      // run for each video in the array
      current.forEach((songs) => {
        let sD = songs.duration;
        let sDh = sD.hours;
        let sDm = sD.minutes;
        let sDs = sD.seconds;
        // uniform video duration
        if (sDs.toString().length == 1) {
          sDs = "0" + sDs;
        }
        if (sDm.toString().length == 1) {
          sDm = "0" + sDm;
        }
        if (sDh.toString().length == 1) {
          sDh = "0" + sDh;
        }
        arr.push(
          `\`\`${position++})\`\` ` +
          `**[${songs.title}](${songs.url})**` +
          `  \`\`duration: ${sDh}:${sDm}:${sDs}\`\``
        );
      });
      qEmbed.setDescription(arr)
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
      if (serverQueue.songs.length <= 10) return;
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
