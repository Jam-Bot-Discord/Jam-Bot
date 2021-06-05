import {Message} from "discord.js"
import {client} from '../customDefinitions'
import {Logger} from "winston"
import {returnInvalidPermissionMessage} from '../functions/util'
const messages = require('../functions/messages')

export const name = 'shutdown'
export const description = 'Gracefully shuts down the bot'
export const usage = 'shutdown'
export async function execute(client: client, message: Message, args, logger: Logger) {
	if (message.author.id == process.env.OWNERID) {
		await message.react('👋')
		await message.channel.send('Shutting Down...')
		// @ts-expect-error
		process.emit('SIGINT')
	} else {
		returnInvalidPermissionMessage(message)
	}
}
