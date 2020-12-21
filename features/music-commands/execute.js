// Execute Module

const YouTube = require("simple-youtube-api");
const { prefix, ytTOKEN, lastFM_api, lastFM_secret, lastFM_username, lastFM_pw } = require("../../config.json");
const youtube = new YouTube(ytTOKEN);
const ytdl = require("ytdl-core");
var scribble = require('scribble');

var Scrobbler = new scribble(lastFM_api, lastFM_secret, lastFM_username, lastFM_pw);

module.exports = {
  
  async play(guild, song, client, queue) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
      queue.delete(guild.id);
      client.user.setActivity("Smash Bros. Mélé");
      return;
    }

    const dispatcher = serverQueue.connection
      .play(
        ytdl(
          song.url,
          {
            highWaterMark: 1 << 25,
          },
          {
            type: "opus",
            quality: "highestaudio",
            filter: "audioonly",
            bitrate: "auto",
          }
        )
      ) // {highWaterMark: 1024*1024*10}
      .on("finish", () => {
        if (!serverQueue.loop) serverQueue.songs.shift();
        module.exports.play(guild, serverQueue.songs[0], client, queue);
      })
      .on("error", (error) => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);

    var srcSong = {
      artist: song.artist,
      track: song.title,
    };

    Scrobbler.NowPlaying(srcSong);
    Scrobbler.Scrobble(srcSong);

    client.user.setActivity(`${prefix}help if you're confused`, {
      type: "PLAYING",
    });
  },

  async execute(message, client, queue) {
    try {
      const args = message.content.split(" ");
      const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
      const serverQueue = queue.get(message.guild.id);
      const video = await youtube.getVideo(url);
      const voiceChannel = message.member.voice.channel;

      if (!voiceChannel)
        return message.channel.send(
          "You need to be in a voice channel to play music!"
        );

      const permissions = voiceChannel.permissionsFor(message.client.user);
      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
          "I need the permissions to join and speak in your voice channel!"
        );
      }

      const song = {
        title: video.title,
        url: video.url,
        decription: video.description,
        duration: video.duration,
        artist: (video.channel.title).split(" - Topic"),
      };

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

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
          var connection = await voiceChannel.join();
          queueContruct.connection = connection;
          module.exports.play(
            message.guild,
            queueContruct.songs[0],
            client,
            queue
          );
        } catch (err) {
          console.log(err);
          queue.delete(message.guild.id);
          return message.channel.send(err);
        }
      } else {
        serverQueue.songs.push(song);
        return message.channel.send(
          `**${song.title}** has been added to the queue!`
        );
      }
    } catch (e) {
      message.channel.send("Playlist was added.");
      message.channel.send(
        `Type **${prefix}q** for the list of songs in the playlist!`
      );
    }
  },

  async handleVideo(message, client, queue) {
    try {
      const args = message.content.split(" ");
      const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      const voiceChannel = message.member.voice.channel;
      message.channel.send(
        `Loading playlist of **${playlist.videos.length}** songs..`
      );

      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id);
        await module.exports.playList(
          video2,
          message,
          voiceChannel,
          client,
          queue,
          true
        );
      }

      return module.exports.playList(
        video,
        message,
        voiceChannel,
        client,
        queue
      );
    } catch {
      module.exports.execute(message, client, queue);
    }
  },

  async playList(
    video,
    message,
    voiceChannel,
    client,
    queue,
    playlist = false
  ) {
    try {
      const serverQueue = queue.get(message.guild.id);
      const song = {
        id: video.id,
        title: video.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        duration: video.duration,
        artist: video.channel.title,
      };
      const vidD = video.duration;
      const sM = vidD.minutes;
      const sS = vidD.seconds;

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

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
          var connection = await voiceChannel.join();
          queueContruct.connection = connection;
          module.exports.play(
            message.guild,
            queueContruct.songs[0],
            client,
            queue
          );
        } catch (err) {
          console.log(err);
          queue.delete(message.guild.id);
          return message.channel.send(err);
        }
      } else {
        serverQueue.songs.push(song);
        console.log(`${song.title}` + ` ${sM}:${sS}`);
        if (playlist) return;
      }
      return;
    } catch {
      message.channel.send("Something happened just now.");
    }
  }, // Generates individual videos in a playlist.
};
