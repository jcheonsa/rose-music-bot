// Connect Rosé to your voice channel

module.exports = {

  commands: ['summon', 'connect', 'start'],
  callback:
    (message) => {
      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        return message.channel.send("You're not in a voice channel!");
      } else {
        voiceChannel
          .join()
          .then(console.log("Rosé was summoned to a voice channel."));
        return;
      }
    },
};
