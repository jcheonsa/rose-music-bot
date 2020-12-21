const Discord = require("discord.js"); // constants
const cron = require("cron"); // time cruncher
const config = require("./config.json");  // configuration
const prefix = config.prefix; // prefix configuration
const arkRS = config.arkRS; // channel for arknights reminders
const myID = config.myID; // make sure the bot doesn't respond to its own messages
const queue = new Map(); // create the queue
const client = new Discord.Client(); // require client
const fs = require('fs');
const path = require('path')
const startup = require('./src/startup')

function arkRemind() {
  try {
    let arkReplies = [
      "Reminder to make sure you did your weekly annihilatio!",
      "Brush your teeth!",
      "Stay hydrated!",
      "Get that weekly orundum!",
      "Reminder to do your annihilations!",
      "Did you spend like 2 hours grinding annihilatio this week yet?",
    ];
    let arkRandom = Math.floor(Math.random() * 6);
    const arkChannel = client.channels.cache.get(arkRS);
    arkChannel.send(arkReplies[arkRandom]);
    console.log("Ark Knights reminder executed!");
  } catch {
    console.log("ArkRS was not found in one server.")
  }
} // Arknights Reminder function

client.once("ready", () => {
  // use * to indicate any value of that parameter; seconds 0-59, minutes 0-59, hours 0-23, day of month 1-31, months 0-11 (jan-dec), day of week 0-6 (sun-sat)
  try {
    const arkReminder = new cron.CronJob("02 00 17 * * 5-6", arkRemind, () => { });
    arkReminder.start();
  } catch {
    console.log("ArkRS was not found in one server.")
  }
  console.log("Rosé is now online!");

  startup(client)

  // load command handlers on bot start up
  const baseFile = 'command-handler.js',
    commandBase = require(`./commands/${baseFile}`)

  const readCommands = dir => {
    const files = fs.readdirSync(path.join(__dirname, dir))
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file))
      if (stat.isDirectory()) {
        readCommands(path.join(dir, file))
      } else if (file !== baseFile) {
        const option = require(path.join(__dirname, dir, file))
        commandBase(client, option)
      }
    }
  }

  readCommands('commands')

});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});
// Initiate these scripts on bot reconnect

client.once("disconnect", () => {
  console.log("Disconnect!");
});
// Initiate these scrips on bot disconnect

client.on("message", async (message) => {
  // command scripts
  if (message.author.id == myID) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.includes(`${prefix}p`)) {
    // play command
    const exe = require("./features/music-commands/execute.js");
    if (message.content.toLowerCase() === `${prefix}pause`) {
      // pause command
      const pS = require("./features/music-commands/pr.js");
      pS.pause(message, serverQueue);
      return;
    }
    try {
      if (
        message.content.includes(
          `${prefix}p `,
          /^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/
        )
      ) {
        exe.handleVideo(message, client, queue);
      }
    } catch {
      message.channel.send("Something went wrong.");
      return;
    }
  } else if (message.content.startsWith(`${prefix}go`)) {
    const pQ = require("./features/music-commands/pQ");
    pQ.priorityQ(message, serverQueue);
    return console.log(`song prioritized`);
    // } else if (message.content.startsWith(`${prefix}seek`)) {
    //   const sK = require("./commands/seek.js");
    //   const args = message.content.split(" ");
    //   const ms = args[1];
    //   sK.seek(message, serverQueue, ms);
  } else if (message.content.startsWith(`${prefix}rm`)) {
    const rmS = require("./features/music-commands/remove");
    const songs = serverQueue.songs;
    rmS.removeSong(message, songs);
  }
});
// Main playback scripts

client.on("message", async (message) => {
  if (!message.content.startsWith(prefix)) {
    return;
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const serverQueue = queue.get(message.guild.id);

  if (command === "lyrics") {
    const genius = require('./features/music-commands/lyrics')
    genius.lyrics(message)
  }

  if (command === "restore") {
    const rez = require("./features/music-commands/restore.js");
    rez.restore(message, client, queue, serverQueue);
  } // restore queue

  if (command === "resume") {
    const rS = require("./features/music-commands/pr.js");
    rS.resume(message, serverQueue);
  } // resume playback

  if (command === "q") {
    const qM = require("./features/music-commands/queue");
    qM.queue(message, serverQueue);
  } // call serverQueue

  if (command === "lfmlove") {
    const lfmlove = require('./features/lfm-commands/lastfmLove');
    lfmlove.love(message, serverQueue);
  }

  if (command === "shuffle") {
    const shuffle = require("./features/music-commands/shuffle.js");
    const songs = serverQueue.songs;
    shuffle.shuffle(songs);
    return message.channel.send(
      `Playlist shuffled! Type **${prefix}q** to check the new playlist!`
    );
  } // shuffle serverQueue

  if (command === "stop") {
    const stop = require("./features/music-commands/stop.js");
    stop.stop(message, serverQueue);
    return;
  } // deletes serverQueue

  if (command === "skip") {
    const skip = require("./features/music-commands/skip.js");
    skip.skip(message, serverQueue, client, queue);
    return;
  } // skip current song

  if (command === "loop") {
    const lS = require("./features/music-commands/loop.js");
    lS.loop(message, queue);
  }

  if (command === "np") {
    try {
      const cMS = require("./util/convertMS.js");
      const ms = serverQueue.connection.dispatcher.streamTime;
      cMS.convertMS(message, serverQueue, ms);
    } catch {
      message.channel.send("There is nothing playing right now.");
    }
  }

  if (command === "test") {
    const lfm = require('./lastFM/lastfm')
    lfm.test(message)
  }

});
// Client messaging scripts

// spotify scripts
client.on("message", (message) => {

  if (!message.content.startsWith(prefix) || message.author.id == myID) {
    return;
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const spotifySearch = require('./features/spotify-commands/spotify-handler')
  const spotifyFav = require('./features/spotify-commands/favArtist')

  if (command === "sysearch") {
    spotifySearch.search(message)
  }

  if (command === "syfav") {
    spotifyFav.checkFav(message)
  }

})

client.on("message", (message) => {

  const gamerWords = [
    "Love you too uwu :hearts:",
    ":hearts: :black_heart: :hearts: :black_heart: ",
    "You can call me Rosie ;)",
    `It's *Rosé*, but I'll forgive you ;)`,
    `Love you too, ${message.author.displayName}!`,
  ];

  let random1 = Math.floor(Math.random() * 5);

  try {
    const responseObject = {
      "i love you rose": gamerWords[random1],
      "i luv you rose": gamerWords[random1],
      "i love rose": gamerWords[random1],
      "we love you rose": gamerWords[random1],
      "we luv you rosé": gamerWords[random1],
      "i love you rosé": gamerWords[random1],
      "i luv you rosé": gamerWords[random1],
      "i love rosé": gamerWords[random1],
      "we love you rosé": gamerWords[random1],
      "we luv you rosé": gamerWords[random1],
      "thank you rose": ":hearts:",
      "good job rose": ":hearts:",
      "thanks rose": ":hearts:",
      "thank you rosé": ":hearts:",
      "good job rosé": ":hearts:",
      "thanks rosé": ":hearts:",
    };
    if (message.content.toLowerCase().includes("blackpink") && !message.author.bot) {
      message.react("💞");
      return;
    }

    if (message.content.toLowerCase().includes("amazing") && !message.author.bot) {
      message.channel.send("Amazing")
      return;
    }

    if (responseObject[message.content.toLowerCase()]) {
      message.channel.send(responseObject[message.content.toLowerCase()]);
      return;
    }

  } catch {
    let replies = [
      "You are DMing a BOT. I only work in actual servers >:(",
      "Play Jhin!",
      "Blackpink sucks.",
      "If you want me in your own server, let Johnnie know!",
      "Sorry.",
      "haha xd lemao ^^;",
      "Consider playing smash brothers too~",
      "You can call me Rosie ;)",
    ];
    let random = Math.floor(Math.random() * 8);
    if (message.channel.type == "dm") {
      message.author.send(replies[random]);
      console.log(`${message.author.username}: ${message.content}`);
    }
  }
})

client.login(config.token);
// Login to Discord
