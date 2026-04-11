import {createClient} from "redis";
import {REDIS_URI} from "../../../config/config.service.js";

export const redisClient = createClient({
  url: REDIS_URI,
});

export const redisConnection = async () => {
  try {
    await redisClient.connect();
    console.log("Conncetion To Redis Successfully 🥳");
  } catch (error) {
    console.log("Conncetion To Redis Failed ❗", error);
  }
};
