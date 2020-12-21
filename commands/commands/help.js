// Help Module

const Discord = require("discord.js");
const { prefix, version, build } = require("../../config.json");

module.exports = {

  commands: ['help', 'hp'],
  minArgs: 0,
  maxArgs: 0,
  callback:
    (message) => {
      const helpEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Rosé commands")
        .setThumbnail("https://thumbs.gfycat.com/QuaintPotableGenet-max-1mb.gif")
        .setDescription(`BLACKPINK sucks. \n Debate me <@104482123125108736>`)
        .addField(
          `**${prefix}summon**`,
          " call me over  to your voice channel ;)."
        )
        .addField(
          `**${prefix}p**`,
          " copy/paste a YouTube URL after p, to add a song to the queue."
        )
        .addField(`**${prefix}skip**`, " skips current song.")
        .addField(`**${prefix}q**`, " shows queue.")
        .addField(`**${prefix}shuffle**`, " shuffles the queue.")
        .addField(
          `**${prefix}go**`,
          " place a song in Up Next: position in queue."
        )
        .addField(`**${prefix}loop**`, " loops the current song.")
        .addField(`**${prefix}pause/resume**`, " pauses/resumes playback.")
        .addField(
          `**${prefix}rm**`,
          " type an integer to remove the song in that queue position."
        )
        .addField(`**${prefix}stop**`, " deletes the entire queue.")
        .addField(
          `**${prefix}search**`,
          " search up something to add using YouTube's search API."
        )
        .addField(
          `**${prefix}lyrics**`,
          " search for the lyrics of a song."
        )
        .addField(
          `**${prefix}sysearch**`,
          " search up artists using Spotify API"
        )
        .addField(
          `**${prefix}syfav**`,
          " check your favorite artists list using Spotify API"
        )
        .setTimestamp()
        .setFooter(
          version + " " + build,
          "https://upload.wikimedia.org/wikipedia/commons/9/99/Jennie_Kim_for_Marie_Claire_Korea_Magazine_on_October_9%2C_2018_%285%29.png"
        );
      message.channel.send(helpEmbed);
      console.log(`Rosé BOT info was accessed`);
      return;
    },
};
