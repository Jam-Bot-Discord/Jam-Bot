const fs = require('fs')
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'))
let Helpmessage = ""
module.exports = {
	name: 'help',
	description: 'Help me',
	execute(client, message, args, db) { // TODO: #5 Actually implement a help command
		for (const file of commandFiles) {
			let addCommand = false
			const command = require(`../commands/${file}`)
			if (command && command.name && command.description){
				if (command.permissions){
					if (message.member.hasPermission(command.permissions)){
						addCommand = true
					}
				} else {
					addCommand = true
				}
			}
			if (addCommand){
				Helpmessage = Helpmessage + '\n' + command.name + ': ' + command.description
			}
		}
		message.channel.send(Helpmessage)
	},
}