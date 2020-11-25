const Discord = require("discord.js"); // constants
const cron = require("cron"); // time cruncher
const config = require("./config.json");  // configuration
const prefix = config.prefix; // prefix configuration
const arkRS = config.arkRS; // channel for arknights reminders
const myID = config.myID; // make sure the bot doesn't respond to its own messages
const queue = new Map(); // create the queue
const client = new Discord.Client(); // require client

// Arknights Reminder function
function arkRemind() {
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
}

client.once("ready", () => {
  // use * to indicate any value of that parameter; seconds 0-59, minutes 0-59, hours 0-23, day of month 1-31, months 0-11 (jan-dec), day of week 0-6 (sun-sat)
  const arkReminder = new cron.CronJob("02 00 17 * * 5-6", arkRemind, () => { });
  arkReminder.start();
  console.log("Rosé is now online!");
});

// Initiate these scripts on bot reconnect
client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

// Initiate these scrips on bot disconnect
client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async (message) => {

  // do not respond to inputs from bots and ones that do not start with command prefix 
  if (message.author.id == myID) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.includes(`${prefix}p`)) {
    // play command
    const exe = require("./commands/execute.js");
    if (message.content.toLowerCase() === `${prefix}pause`) {
      // pause command
      const pS = require("./commands/pr.js");
      pS.pause(message, serverQueue);
      return;
    }
    // check if URL is to a playlist or an individual video
    try {
      if (
        message.content.includes(
          `${prefix}p `,
          /^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/
        )
      ) {
        // if URL is a playlist, run the playlist module
        exe.handleVideo(message, client, queue);
      }
    } catch {
      message.channel.send("Please submit a valid URL.");
      return;
    }

    // priority song
  } else if (message.content.startsWith(`${prefix}go`)) {
    const pQ = require("./commands/pQ.js");
    pQ.priorityQ(message, serverQueue);
    return console.log(`song prioritized`);

    // seeking
  } else if (message.content.startsWith(`${prefix}seek`)) {
    const sK = require("./commands/seek.js");
    const args = message.content.split(" ");
    const ms = args[1];
    sK.seek(message, serverQueue, ms);

    // song remove
  } else if (message.content.startsWith(`${prefix}rm`)) {
    const rmS = require("./commands/remove.js");
    const songs = serverQueue.songs;
    rmS.removeSong(message, songs);
  } else {
  }
});
// Main playback scripts

client.on("message", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.id == myID) {
    return;
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const serverQueue = queue.get(message.guild.id);

  if (responseObject[message.content.toLowerCase()]) {
    message.channel.send(responseObject[message.content.toLowerCase()]);
    return;
  }
  const tS = require("./commands/translate.js");
  tS.translate(message, args, command);
  // try running a message with this script

  // restore queue
  if (command === "restore") {
    const rez = require("./commands/restore.js");
    rez.restore(message, client, queue, serverQueue);
  }

  // resume playback
  if (command === "resume") {
    const rS = require("./commands/pr.js");
    rS.resume(message, serverQueue);
  }

  // call bot to voice channel
  if (command === "summon") {
    const sM = require("./commands/summon.js");
    sM.summon(message);
  }

  // call serverQueue
  if (command === "q") {
    const qM = require("./commands/queue.js");
    qM.queue(message, serverQueue);
  }

  // search for youtube song
  if (command === "search") {
    const YTs = require("./commands/search.js");
    YTs.search(message);
  }

  // shuffle serverQueue
  if (command === "shuffle") {
    const shuffle = require("./commands/shuffle.js");
    const songs = serverQueue.songs;
    shuffle.shuffle(songs);
    return message.channel.send(
      `Playlist shuffled! Type **${prefix}q** to check the new playlist!`
    );
  }

  // deletes serverQueue
  if (command === "stop") {
    const stop = require("./commands/stop.js");
    stop.stop(message, serverQueue);
    return;
  }

  // display commands
  if (command === "help") {
    const hP = require("./commands/help.js");
    hP.help(message);
  }

  // skip current song
  if (command === "skip") {
    const skip = require("./commands/skip.js");
    skip.skip(message, serverQueue, client, queue);
    return;
  }

  // google-translate function
  if (command === "translate") {
    const tS = require("./commands/translate.js");
    tS.tHelp(message, command);
  }

  // loop music
  if (command === "loop") {
    const lS = require("./commands/loop.js");
    lS.loop(message, queue);
  }

  // now playing 
  if (command === "np") {
    try {
      const cMS = require("./util/convertMS.js");
      const ms = serverQueue.connection.dispatcher.streamTime;
      cMS.convertMS(message, serverQueue, ms);
    } catch {
      message.channel.send("There is nothing playing right now.");
    }
  }

});
// Client messaging scripts

client.login(config.token);
// Login to Discord
