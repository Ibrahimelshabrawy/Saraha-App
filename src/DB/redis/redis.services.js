import {redisClient} from "./redis.db.js";
// `revokeToken::${req.user._id}::${req.verify.jti}`;

export const revokeKey = ({userId, jti}) => {
  return `revokeToken::${userId}::${jti}`;
};

export const getKeyUserId = ({userId}) => {
  return `revokeToken::${userId}`;
};

export const set = async ({key, value, ttl = null} = {}) => {
  try {
    const data = typeof value === "string" ? value : JSON.stringify(value);

    if (ttl) {
      // ttl by seconds
      await redisClient.setEx(key, ttl, data);
    } else {
      await redisClient.set(key, data);
    }

    return true;
  } catch (error) {
    console.error("Redis SET error:", error);
    return false;
  }
};

export const get = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (error) {
    console.error("Redis GET error:", error);
    return null;
  }
};

export const update = async ({key, value, ttl = null} = {}) => {
  try {
    const exists = await redisClient.exists(key);
    if (!exists) return false;
    return await redisClient.set(key, value, ttl);
  } catch (error) {
    console.error("Redis UPDATE error:", error);
    return false;
  }
};

export const deleteKey = async (key) => {
  try {
    if (!key.length) return 0;
    const result = await redisClient.del(key);
    return result === 1;
  } catch (error) {
    console.error("Redis DELETE error:", error);
    return false;
  }
};

export const expire = async ({key, ttl} = {}) => {
  try {
    const result = await redisClient.expire(key, ttl);
    return result === 1;
  } catch (error) {
    console.error("Redis EXPIRE error:", error);
    return false;
  }
};

export const ttl = async (key) => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.error("Redis TTL error:", error);
    return -2;
  }
};

export const keys = async (pattern) => {
  return await redisClient.keys(`${pattern}*`);
};
