// Help Module

const Discord = require("discord.js");
const { prefix, version, build } = require("../../config.json");

module.exports = {

  commands: ['help', 'hp', 'info'],
  minArgs: 0,
  maxArgs: 0,
  callback:
    (message) => {
      const helpEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Rosé commands")
        .setThumbnail("https://thumbs.gfycat.com/QuaintPotableGenet-max-1mb.gif")
        .setDescription(
          `BLACKPINK sucks. \n Debate me <@104482123125108736> \n
          \`\`${prefix}summon/connect\`\` - call me over to your voice channel ;) \n
          \`\`${prefix}play/p\`\` - copy/paste a YouTube URL to add a song to the queue. \n
          \`\`${prefix}skip\`\` - skips the current song. \n
          \`\`${prefix}queue/q\`\` - shows queue. \n
          \`\`${prefix}shuffle\`\` - shuffles the queue. \n
          \`\`${prefix}go\`\` - place a song in Up Next: position in queue. \n
          \`\`${prefix}pause/resume\`\` - pauses/resumes playback. \n
          \`\`${prefix}loop\`\` - loops the current song. (toggle) \n
          \`\`${prefix}rm\`\` - type an integer to remove the song in that queue position. \n
          \`\`${prefix}stop\`\` - deletes the entire queue. \n
          \`\`${prefix}nowplaying/np\`\` - check what's currently playing. \`\`wip\`\`\n
          \`\`${prefix}seek\`\` - followed by a timestamp. \n
          \`\`${prefix}search/plsearch\`\` - search up a song or playlist on YouTube to add to the queue. \n
          \`\`${prefix}lyrics\`\` - search for the lyrics of a song. \n
          \`\`${prefix}sysearch/syfav\`\` - search up artists using the Spotify API. \`\`wip\`\`\n
          \`\`${prefix}translate\`\` - learn how to use the google-translate-api. \`\`wip\`\`\n
          \`\`${prefix}insta\`\` - search up public Instagram accounts. \`\`wip\`\`\n
          `
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
