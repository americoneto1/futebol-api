module.exports = {
    host: process.env.REDIS_URL || 'localhost',
    expire: 60 //seconds
}