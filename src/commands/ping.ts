import { Message } from "discord.js"
import { client } from '../customDefinitions'
import { Logger } from "winston"

export let name = 'ping'
export let description = 'Displays various latency information'
export let usage = 'ping'
export async function execute(client: client, message: Message, args, logger: Logger) {
	message.react('🏓')
	const sent = await message.channel.send('Pong! 🏓')
	sent.edit(
		`🏓 Roundtrip latency: ${sent.createdTimestamp - message.createdTimestamp
		}ms. API Latency is ${Math.round(client.ws.ping)}ms 🏓`
	) // https://discordjs.guide/popular-topics/faq.html#how-to-check-the-bots-ping
}
