import { redis } from '../config/redis.js';



// GET CACHE WHICH IS TAKING DATA FROM REDIS
const getCache = async (key) => {
    try {

        const data = await redis.get(key);

        if (!data) return null;

        // TYPE CHECK 
        if (typeof data === 'object') return data;

        // If data is in string format then parse it
        if (typeof data === 'string') return JSON.parse(data);

        return null;
    } catch (error) {
        return null;
    }
};




// SET CACHE WHICH IS SETTING DATA FROM REDIS
const setCache = async (key, value, ttl = 300) => {
    try {
        await redis.set(key, value, { ex: ttl });
        return true;
    } catch (error) {
        return false;
    }
};




// DELETE CACHE WHICH DELETES DATA FROM REDIS 
const deleteCache = async (key) => {
    try {
        await redis.del(key);
        return true;
    } catch (error) {
        return false;
    }
};





const deleteCacheByPattern = async (pattern) => {
    try {

        const keys = await redis.keys(pattern);

        if (keys && keys.length > 0) {
            await redis.del(...keys);
        }

        return true;
    } catch (error) {
        return false;
    }
};




export { setCache, getCache, deleteCache, deleteCacheByPattern }