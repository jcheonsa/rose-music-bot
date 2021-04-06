// Translate module
const Discord = require("discord.js");
const language = require('../../util/translation/langOptions');
const translate = require("@vitalets/google-translate-api");
const { prefix } = require('../../config.json');

module.exports = {
  translate: (message, args, command) => {
    if (language.some((ele) => ele.abrv === command)) {
      if (args.length === 0) {
        message.reply("error");
      } else {
        let lang_to = language.filter((ele) => ele.abrv === command)[0].abrv;
        let text = args.slice(0).join(" ");
        translate(text, {
          to: lang_to,
        })
          .then((res) =>
            message.channel.send(res.text + " \n" + `*${res.pronunciation}*`)
          )
          .catch((err) =>
            console.log()
          );
      }
    }
  },

  tHelp: (message, command) => {
    if (command === "translate") {
      translate("Learn how to use this feature!", {
        to: "ko",
      }).then((res) => {
        console.log("Translation instructions accessed.");
        message.channel.send(res.text);
      });
      const translationEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Google-Translate API")
        .setDescription(
          `Type **${prefix}** then a language code followed by the message you want translated.`
        )
        .addField(
          `**Syntax**`,
          `${prefix}(language abbreviation) [message you want translated]` +
          `\n`
        )
        .addField(
          `${prefix}ko Hello, my name is Rosé!`,
          "안녕하세요, 제 이름은 로제!" + `\n`
        )
        .addField(
          `${prefix}ja So you are approaching me?`,
          "あなたは私に近づいていますか？" + `\n`
        )
        .addField(`${prefix}en 雪花飘飘.`, "Fluttering snow.")
        .setTimestamp()
        .setFooter(
          "Ask Johnnie for language abbreviations if you don't know them."
        );
      message.channel.send(translationEmbed);
    }
  },
};
