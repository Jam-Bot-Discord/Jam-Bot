// https://api.pexels.com/v1
const config = require('../config.json')
const random = require('random')
const fetch = require('node-fetch')
module.exports = {
	name: 'stock',
	description: 'Gets a random stock image',
	usage: 'stock nature',
	async execute(client, message, args, db) {
        if (!config.settings.pexelsApiKey) return
        if (!args[0]) return message.channel.send('Specify an image to search for')
        const response = await fetch(`https://api.pexels.com/v1/search?query=${args[0]}&per_page=15`, {
            headers: {
                'Authorization': config.settings.pexelsApiKey
            }
        })
        const json = await response.json()
        const image = json.photos[random.int(min=0, max=json.photos.length-1)].src.medium
        message.channel.send(image)
	},
};