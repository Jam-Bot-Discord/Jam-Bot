import { Emoji, Message } from "discord.js"
import { client } from '../../customDefinitions'
export const name = 'addemoji'
export const description = 'Adds an emoji to the server'
export const usage = 'addemoji EmojiName'
export const permissions = ['MANAGE_EMOJIS']
export function execute(client: client, message: Message, args) {
	if (!args[0])
		return message.reply('you need to specify a name for your emoji!')
	const url = message.attachments.first()
	if (!url)
		return message.reply('you need to attach the image of the emoji!')
	message.guild.emojis
		.create(url.url, args[0], {
			reason: `Uploaded by: ${message.author.tag}, ${message.author.id}`,
		})
		.then((emoji: Emoji) => {
			message.channel
				.send(`The emoji "${emoji.name}" was created!`)
				.then((sent) => {
					sent.react(emoji.identifier)
					message.react(emoji.identifier)
				})
		})
		.catch((error) => {
			client.logger.error(error)
			message.reply(
				'uwu senpai, loowks like youwr image is a liwttle too big!'
			)
		})
}
