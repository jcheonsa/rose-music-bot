// Arknights Reminder Code

const cron = require("cron"); // time cruncher

module.exports = {
  arkRemind: () => {
    let arkReplies = [
      "Reminder to make sure you did your weekly annihilatio!",
      "Brush your teeth!",
      "Stay hydrated!",
      "Get that weekly orundum!",
      "Reminder to do your annihilations!",
      "Did you spend like 2 hours grinding annihilatio this week yet?",
    ];
    let arkRandom = Math.floor(Math.random() * 6);
    const arkChannel = client.channels.cache.get("715362094458994730");
    arkChannel.send(arkReplies[arkRandom]);
    console.log("Ark Knights reminder executed!");
  },
};
