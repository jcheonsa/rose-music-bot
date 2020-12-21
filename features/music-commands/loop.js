// Loop Function

module.exports = {
  async loop(message, queue) {
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
        loop: false,
      };
    }

    serverQueue.loop = !serverQueue.loop;
    return message.channel
      .send(`Loop is now ${serverQueue.loop ? "**on**!" : "**off**!"}`)
      .catch(console.error);
  },
};
