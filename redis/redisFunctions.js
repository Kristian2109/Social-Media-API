const redisClient = require("./redis.config");
const CACHE_EXP= 3600 * 24 * 10;

function getOrSetCache(key, cb) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await redisClient.get(key);
            if (data) resolve(JSON.parse(data));

            const freshData = await cb();
            if (!freshData) resolve(null);

            await redisClient.setEx(key, CACHE_EXP, JSON.stringify(freshData));
            resolve(freshData);

        } catch (error) {
            console.log(error.message);
            reject(error);
        }
    });
}

async function updateCache(key, cb) {
    const newData = await cb;
    const oldData = await redisClient.getSet(key, JSON.stringify(newData));
    return oldData;
}

async function deleteCache(key) {
    await redisClient.del(key);
}

module.exports = {
    getOrSetCache, updateCache, deleteCache
}