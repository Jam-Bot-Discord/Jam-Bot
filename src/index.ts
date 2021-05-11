// Mr imports
const Discord = require('discord.js')
const fs = require('fs')
const client = new Discord.Client()
const schedule = require('node-schedule')
const { createLogger, format, transports } = require('winston')
const winston = require('winston')
const { combine, timestamp, label, printf } = format
if (process.env.NODE_ENV !== 'production') {
    let dotenv = require('dotenv').config()
}

// Event imports
const guildCreate = require('./events/guildCreate')
const guildDelete = require('./events/guildDelete')
const message = require('./events/message')
const messageDelete = require('./events/messageDelete')
const guildMemberAdd = require('./events/guildMemberAdd')
const voiceStateUpdate = require('./events/voiceStateUpdate')

// Misc Scripts
const dbScript = require('./functions/db')
const twitch = require('./cron/twitch')

// Logging
const loggingFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${level}: ${message}`
})
const logger = createLogger({
    level: 'info',
    format: combine(timestamp(), loggingFormat),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
})
process.on('uncaughtException', function (err) {
    logger.error(err.message)
})

// Registers all the commands in the commands folder
// https://discordjs.guide/command-handling/dynamic-commands.html#how-it-works
client.commands = new Discord.Collection()
const commandFiles = fs
    .readdirSync('./commands')
    .filter((file) => file.endsWith('.js'))
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
}

// Database connections
const db = dbScript.connect(logger)
if (!db) {
    logger.error('DB not found')
    process.exit(1)
}

// Events
client.on('guildCreate', (guild) => {
    guildCreate.register(guild, db, logger)
})
client.on('guildDelete', (guild) => {
    guildDelete.register(guild, db)
})
client.on('message', (msg) => {
    message.register(client, msg, db, logger)
})
client.on('messageDelete', (msg) => {
    messageDelete.register(client, msg, db)
})
client.on('guildMemberAdd', (member) => {
    guildMemberAdd.register(member)
})
client.on('error', (error) => {
    logger.error(error)
})
client.on('invalidated', function () {
    process.emit('SIGINT')
})
client.on('guildUnavailable', (guild) => {
    logger.error(`Guild ${guild.id} has gone unaviliable.`)
})
client.on('warn', (info) => {
    logger.warn(info)
})
client.on('rateLimit', (rateLimitInfo) => {
    logger.error(
        `Rate limit hit. Triggered by ${rateLimitInfo.path}, timeout for ${rateLimitInfo.timeout}. Only ${rateLimitInfo.limit} can be made`
    )
})
client.on('voiceStateUpdate', (oldState, newState) => {
    voiceStateUpdate.register(client, oldState, newState)
})

// SIGINT STUFF
if (process.platform === 'win32') {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.on('SIGINT', function () {
        process.emit('SIGINT')
    })
}
process.on('SIGINT', function () {
    // Shutdown stuff nicely
    logger.info('Recieved SIGINT, gracefully shutting down.')
    client.destroy()
    process.exit()
})

// Intialisation
client.on('ready', () => {
    logger.info('Logged in at ' + Date.now())
    client.user.setActivity('?help', { type: 'WATCHING' })
    if (process.env.twitchApiClientId && process.env.twitchApiSecret) {
        // Only if api tokens are present
        schedule.scheduleJob('*/5 * * * * *', function () {
            // Twitch notifications
            twitch.execute(client, db, logger)
        })
    }
})

client.login(process.env.token)