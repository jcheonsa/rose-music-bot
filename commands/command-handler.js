const { prefix } = require('../config.json')

const validatePermissions = (permissions) => {
    const validPermissions = [
        'CREATE_INSTANT_INVITE',
        'KICK_MEMBERS',
        'BAN_MEMBERS',
        'ADMINISTRATOR',
        'MANAGE_CHANNELS',
        'MANAGE_GUILD',
        'ADD_REACTIONS',
        'VIEW_AUDIT_LOG',
        'PRIORITY_SPEAKER',
        'STREAM',
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE',
        'USE_EXTERNAL_EMOJIS',
        'VIEW_GUILD_INSIGHTS',
        'CONNECT',
        'SPEAK',
        'MUTE_MEMBERS',
        'DEAFEN_MEMBERS',
        'MOVE_MEMBERS',
        'USE_VAD',
        'CHANGE_NICKNAME',
        'MANAGE_NICKNAMES',
        'MANAGE_ROLES',
        'MANAGE_WEBHOOKS',
        'MANAGE_EMOJIS',
    ]

    for (const permission of permissions) {
        if (!validPermissions.includes(permission)) {
            throw new Error(`Unknown permission node "${permission}"`)
        }
    }
}

module.exports = (client, commandOptions) => {
    let {
        commands,
        expectedArgs = '',
        permissionError = "You don't have the right permissions.",
        minArgs = 0,
        maxArgs = null,
        permissions = [],
        requiredRoles = [],
        cooldown = -1,
        callback
    } = commandOptions

    // ensure command and alias are in an array
    if (typeof commands === 'string') {
        commands = [commands]
    }

   console.log(`Registering command *${commands[0]}*`)

    if (permissions.length) {
        if (typeof permissions === 'string') {
            permissions = [permissions]
        }

        validatePermissions(permissions)
    }

    client.on('message', message => {
        const { member, content, guild } = message

        for (const alias of commands) {
            if (content.toLowerCase().startsWith(`${prefix}${alias.toLowerCase()}`)) {
                // a command has been ran

                // ensure the user has the required permissions
                for (const permission of permissions) {
                    if (!member.hasPermission(permission)) {
                        message.reply(permissionError)
                        return
                    }
                }

                for (const requiredRole of requiredRoles) {
                    const role = guild.roles.cache.find(role =>
                        role.name === requiredRole)

                    if (!role || !member.roles.cache.has(role.id)) {
                        message.reply(`You must have the ${requiredRole} role to use this command.`)
                        return
                    }
                }

                // command cooldown - ensure user does not run this command too frequently
                let cooldownString = `${guild.id}-${member.id}-${commands[0]}`
                if (cooldown > 0 && recentlyRan.includes(cooldownString)) {
                    message.reply("Command on cooldown, please wait.")
                    return
                }

                // split on any number of spaces
                const arguments = content.split(/[ ]+/)

                //remove command which is the first index
                arguments.shift()

                //ensure we have correct arg number
                if (arguments.length < minArgs || (
                    maxArgs !== null && arguments.length > maxArgs
                )) {
                    message.reply(`Incorrect syntax. Use ${prefix}${alias} ${expectedArgs}`)
                    return
                }

                if (cooldown > 0) {
                    recentlyRan.push(cooldownString)

                    setTimeout(() => {

                        console.log('Before:', recentlyRan)

                        recentlyRan = recentlyRan.filter((string) => {
                            return string !== cooldownString
                        })

                        console.log('After:', recentlyRan)
                    }, 1000 * cooldown);
                }

                // handl custom command code
                callback(message, arguments, arguments.join(' '))

                return
            }
        }
    })

}