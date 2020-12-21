const lastFMSchema = require("../../../schemas/lastFMSchema")
const mongoose = require("../../../util/mongoose")

module.exports = {

    commands: ['lfmregister, lfmreg, lfmr'],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: `**<user-name>**`,
    description: "Top Artists for users",
    callback: async (message) => {

        return await mongoose().then(async (mongoose) => {

            const member = message.member
            const args = message.content.split(" ")

            try {
                const userData = await lastFMSchema.findOneAndUpdate({
                    userID: member.id,
                }, {
                    userID: member.id,
                    discord: member.nickname,
                    username: args[1]
                },
                    {
                        upsert: true,
                        new: true,
                    });
                message.reply(`Logged **${args[1]}** into the lastFM db!`)
                return console.log(userData.username);
            } finally {
                mongoose.connection.close();
            }
        })
    }

}