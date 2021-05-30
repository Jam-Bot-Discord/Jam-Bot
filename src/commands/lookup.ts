import { Message, MessageEmbed, Role } from "discord.js"
import { client } from '../customDefinitions'
import { Logger } from "winston"

export const name = 'lookup'
export const description = 'Displays information about a specific user or role'
export const permissions = ['MANAGE_MESSAGES']
export const usage = 'lookup @user|@role'
export async function execute(client: client, message: Message, args, logger: Logger) {
	if (!args[0]) return message.reply('Usage: ' + this.usage)
	// Basic info
	message.channel.send(':mag_right: Looking up...').then(async (sent) => {
		const embed = new MessageEmbed
		const user =
			message.mentions.members.first() ||
			await message.guild.members.fetch(args[0])
		if (user) {
			// Valid user found, get info
			const userName =
				user.user.username + '#' + user.user.discriminator
			const avatar =
				user.user.avatarURL() || user.user.defaultAvatarURL
			const isBot = String(user.user.bot).toUpperCase()
			const createdAt = user.user.createdAt
			const nickName = user.nickname || user.user.username
			const { id } = user
			let roles = ''
			user.roles.cache.forEach((role) => {
				roles = `${roles} ${role.name},`
			})
			embed.addField('Nickname', nickName, true)
			embed.addField('Account Creation', createdAt, true)
			embed.addField('Id', id, true)
			embed.addField('Bot', isBot, true)
			embed.addField('Roles', roles, true)
			embed.setAuthor('User: ' + userName, avatar)

		} else {
			// Didn't get a valid user, maybe its a role?
			const role: Role =
				message.mentions.roles.first() ||
				await message.guild.roles.fetch(args[0])
			if (role) {
				// Valid role
				const { id, position, createdAt, name, mentionable } = role
				embed.addField('ID', id, true)
				embed.addField('Mentionable', String(mentionable), true)
				embed.addField('Position', position, true)
				embed.addField('Created At', createdAt, true)
				embed.setTitle('Role: ' + name)
			} else {
				// No role or user found
				return sent.edit('That is not a valid user or role.')
			}
		}
		const intiatedUser = message.author.tag
		const intiatedAvatar = message.member.user.avatarURL()
		embed.setFooter('Command issued by ' + intiatedUser, intiatedAvatar)
		embed.setColor('#007991')
		embed.setTimestamp(Date.now())
		sent.edit({ 'content': null, 'embed': embed })
	})
}