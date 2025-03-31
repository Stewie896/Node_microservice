const {Redis} = require('ioredis');
const {logger} = require('../../utils/logger')


const clientRedis = new Redis(process.env.RED_IS);
clientRedis.on('connect' , ()=>{
    logger.info("CONNECTED TO API GATEWAY RE-DIS" )
})

module.exports = {clientRedis}