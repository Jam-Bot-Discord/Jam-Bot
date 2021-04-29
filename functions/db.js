module.exports = {
    connect(logger) {
        let Keyv
        let NodeCache
        try {
            Keyv = require('keyv')
            NodeCache = require('node-cache')
        } catch (err) {
            logger.error('Error requiring keyv or node-cache')
            logger.error(err)
            return null
        }
        this.db = new Keyv(process.env.DATABASE_URL)
        if (!this.db) return null
        this.dbCache = new NodeCache({ stdTTL: 300, checkperiod: 60 })
        return require('./db')
    },
    async updateKey(guild, key, value) {
        if (process.env.NODE_ENV !== 'production')
            console.log(`Updating ${key} to ${value}`)
        let tempValue
        tempValue = await this.db.get(guild.id)
        if (!tempValue) tempValue = {}
        tempValue[key] = value
        await this.db.set(guild.id, tempValue)
        await this.dbCache.set(guild.id, tempValue)
        return true
    },
    async get(guild, key) {
        let cacheValue = await this.dbCache.get(guild.id)
        if (cacheValue && cacheValue[key]) {
            if (process.env.NODE_ENV !== 'production')
                console.log(
                    `Got ${key} from CACHE with value: ${cacheValue[key]}`
                )
            return cacheValue[key] // If found in cache, return it
        }
        let tempValue = await this.db.get(guild.id) // Key isn't in cache, get it from db
        if (!tempValue) tempValue = {} // Guild hasn't got any keys yet
        if (!tempValue[key]) {
            //console.log(`Requested ${key} was ${tempValue[key]}`)
            return null // Key doesn't exist
        }
        this.dbCache.set(guild.id, tempValue) // Put the key into the cache
        if (process.env.NODE_ENV !== 'production')
            console.log(`Got ${key} from DB with value: ${tempValue[key]}`)
        return tempValue[key] // Return the value from db
    },
}
