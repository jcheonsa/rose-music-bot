// Execute Module
const YouTube = require("simple-youtube-api");
const { prefix, ytTOKEN, lastFM_api, lastFM_secret } = require("../../config.json");
const youtube = new YouTube(ytTOKEN);
const ytdl = require("ytdl-core");
var scribble = require('scribble');

var Scrobbler = new scribble(lastFM_api, lastFM_secret);

module.exports = {

  // main playback handler
  async play(guild, song, client, queue) {
    const serverQueue = queue.get(guild.id);

    // if there are no more objects in the queue, safely clear queue
    if (!song) {
      queue.delete(guild.id);
      client.user.setActivity("Smash Bros. Mélé");
      return;
    }

    // set the audio stream using FFMPEG
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

    // get information on the current song to be scrobbled
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

  // play a non-playlist YouTube video
  async execute(message, client, queue) {
    try {
      const args = message.content.split(" ");
      const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
      const serverQueue = queue.get(message.guild.id);
      const video = await youtube.getVideo(url);
      const voiceChannel = message.member.voice.channel;

      // check for voice channel connection
      if (!voiceChannel)
        return message.channel.send(
          "You need to be in a voice channel to play music!"
        );

      // make sure rosé has permissions to connect and stream audio to a voice channel
      const permissions = voiceChannel.permissionsFor(message.client.user);
      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
          "I need the permissions to join and speak in your voice channel!"
        );
      }

      // get song information based on YouTube API
      const song = {
        title: video.title,
        url: video.url,
        decription: video.description,
        duration: video.duration,
        artist: (video.channel.title).split(" - Topic"),
      };

      // create a queue of songs for your server if one doesn't already exist
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
        // once created, add a song to the back of the queue
        queueContruct.songs.push(song);

        // connect to a voice channel and start playing the song in the first position of queue
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
        // if there is already a song playing, then add it to the back of the queue
      } else {
        serverQueue.songs.push(song);
        return message.channel.send(
          `**${song.title}** has been added to the queue!`
        );
      }
    } catch {
      // let the user know if it was a playlist that was added
      message.channel.send("Playlist was added.");
      message.channel.send(
        `Type **${prefix}q** for the list of songs in the playlist!`
      );
    }
  },

  // main playlist handler
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

      // distinguish each subsequent video in the playlist
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
      // if the link is not a playlist, treat it as an individual video
      module.exports.execute(message, client, queue);
    }
  },

  // build a video from a playlist and set the queue
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
  },
};
