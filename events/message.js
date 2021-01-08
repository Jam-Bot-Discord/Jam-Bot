const permissions = require('../functions/permission')
const random = require('random')
const errorMessages = ['Nice try.', 'Not this time.', 'No.', 'No thanks.', 'Don\'t.', 'That ain\'t gonna work', 'No sorry.', 'Permissions say no.']
module.exports = {
	register(client, msg, db, config){
		if (msg.author.bot) return
		const message = String(msg.content).toLowerCase()
		const guild = msg.guild
		db.get('SELECT "value" FROM "' + guild + '" WHERE key="prefix"', (err, row) => { // Get prefix
			if (err) console.log(err)
			if (row){
				prefix = String(row.value)
			} else {
				prefix = config.defaults.prefix
			}
			const args = msg.content.slice(prefix.length).trim().split(/ +/)
			const command = args.shift().toLowerCase()
			if (message.startsWith(prefix)){
				if (!client.commands.has(command)) return // If the command isn't registered don't do anything, maybe error message here?
				try {
					if (client.commands.get(command).permissions){
						if (!permissions.checkperm(msg.member, client.commands.get(command).permissions)){
							return msg.reply(errorMessages[random.int(min=0, max=errorMessages.length-1)])
						}
					}
					client.commands.get(command).execute(client, msg, args, db)
				} catch (error) {
					console.error(error)
					msg.reply('there was an error trying to execute that command!')
				}
			}
		})
        
	}
}