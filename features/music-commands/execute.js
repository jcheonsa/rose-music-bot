// Execute Module

const YouTube = require("simple-youtube-api");
const Discord = require("discord.js");
const { prefix, ytTOKEN, lastFM_api, lastFM_secret } = require("../../config.json");
const youtube = new YouTube(ytTOKEN);
const ytdl = require("ytdl-core");
var scribble = require('scribble');

var Scrobbler = new scribble(lastFM_api, lastFM_secret);

module.exports = {

  // takes a valid song URL and streams the audio
  async play(guild, song, client, queue) {
    const serverQueue = queue.get(guild.id);

    // if no song is selected, run this script
    if (!song) {
      queue.delete(guild.id);
      client.user.setPresence({
        activity: {
          name: `${client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c)} users`,
          type: 'LISTENING',
        },
        status: 'idle',
      })

      return;
    }

    // set the ytdl object parameters
    const ytdlOptions = {
      highWaterMark: 1 << 25,
      quality: "highestaudio",
      filter: "audioonly",
      bitrate: "auto",
    }

    // if the song url contains a timestamp, add a time marker in the ytdl object parameters
    if (song.url.includes(`t=`)) {
      var timestamp = song.url.split(`t=`)[1]
      var streamOptions = {
        seek: timestamp,
        highWaterMark: 1
      }
    } else {
      var streamOptions = {
        seek: 0,
        highWaterMark: 1
      }
    }
    // construct audio dispatcher (bind to specified guild)
    const dispatcher = serverQueue.connection
      .play(
        ytdl(
          song.url,
          ytdlOptions
        ), streamOptions
      )
      // once a song is finished, run this script
      .on("finish", () => {
        if (!serverQueue.loop) serverQueue.songs.shift();
        module.exports.play(guild, serverQueue.songs[0], client, queue);
      })
      .on("error", (error) => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

    // if song url contains a timestamp, give a customized notice to music channel
    if (song.url.includes(`t=`)) {
      if (timestamp < 60) {
        if (timestamp.toString().length == 1) {
          serverQueue.textChannel.send(`Start playing: **${song.title}** from **00:0${timestamp}**`);
        } else {
          serverQueue.textChannel.send(`Start playing: **${song.title}** from **00:${timestamp}**`);
        }
      } else {
        let min = Math.floor(timestamp / 60)
        let sec = timestamp % 60
        serverQueue.textChannel.send(`Start playing: **${song.title}** from **${min}:${sec}**`);
      }
    } else {
      serverQueue.textChannel.send(`Start playing: **${song.title}**`);
    }
    var srcSong = {
      artist: song.artist,
      track: song.title,
    };

    // scrobble playhistory to lastFM
    Scrobbler.NowPlaying(srcSong);
    Scrobbler.Scrobble(srcSong);

    client.user.setPresence({
      activity: {
        name: `music`,
        type: 'LISTENING',

      },
      status: 'online',
    })
  },

  // handles individual urls
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
      // if timestamped url, include the entire url for the play module to process
      if (url.includes("t=")) {
        var song = {
          title: video.title,
          url: url,
          decription: video.description,
          duration: video.duration,
          thumbnail: video.thumbnails.high.url,
          artist: (video.channel.title).split(" - Topic"),
        };
      } else {
        // if not timestamped, send url to the vide handler module
        var song = {
          title: video.title,
          url: video.url,
          description: video.description,
          duration: video.duration,
          thumbnail: video.thumbnails.high.url,
          artist: (video.channel.title).split(" - Topic"),
        };
      }
      // if no queue, build and bind queue to a text & voice channel within corresponding guild
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
        // push this song to array
        queueContruct.songs.push(song);

        // attempt to connect to voice channel
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

        // send a message when successfully adding a song
        var queuePOS = serverQueue.songs.length
        console.log(song)
        console.log(serverQueue)
        selectEmbed = new Discord.MessageEmbed()
          .setAuthor("Added to the queue: ")
          .setTitle(`${song.title}`)
          .setURL(`${song.url}`)
          .setThumbnail(`${song.thumbnail}`)
          .setColor("#cc8bc7");

        if (queuePOS === 1) {
          selectEmbed.setDescription(`\`\`position in queue:\`\` Up Next`)
        } else {
          selectEmbed.setDescription(`\`\`position in queue:\`\` ${serverQueue.songs.length}`)
        }
        message.channel.send(selectEmbed)

        serverQueue.songs.push(song);
        return message.channel.send(
          `**${song.title}** has been added to the queue!`
        );
      }
    } catch (e) {
      message.channel.send("Playlist was added.");
      message.channel.send(
        `Type **${prefix}queue/q** for the list of songs in the playlist!`
      );
    } finally {

    }
  },

  // primarily handles playlists
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

  // generates individual videos from the playlist url
  async playList(
    video,
    message,
    voiceChannel,
    client,
    queue,
    playlist = false
  ) {

    // check for an existing music queue in the guild
    try {
      const serverQueue = queue.get(message.guild.id);
      const song = {
        id: video.id,
        title: video.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        duration: video.duration,
        thumbnail: video.thumbnails.high.url,
        artist: video.channel.title,
      };
      const vidD = video.duration;

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
        // if playlist url, loop the script
        if (playlist) return;
      }
      return;
    } catch {
      message.channel.send("Something happened just now.");
    }
  },
};
