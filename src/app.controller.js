import express from "express";
import checkConnection from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors";
import {redisConnection} from "./DB/redis/redis.db.js";
import messageRouter from "./modules/messages/message.controller.js";
import {PORT, WHITELIST} from "../config/config.service.js";
import helmet from "helmet";
import {rateLimit} from "express-rate-limit";
const app = express();

const bootstrap = async () => {
  const limiter = rateLimit({
    windowMs: 60 * 3 * 1000,
    limit: 10,
  });

  const corsOptions = {
    origin: function (origin, callback) {
      if ([...WHITELIST, undefined].includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("not allow by cors"));
      }
    },
  };

  app.use(cors(corsOptions), helmet(), limiter, express.json());

  app.get("/", (req, res, next) => {
    res.status(200).json({
      message: "Welcome To Saraha Application 🥳🥳",
    });
  });

  // Connection DB
  checkConnection();

  // Connection Redis
  redisConnection();

  // static files
  app.use("/uploads", express.static("uploads"));

  // Routers
  app.use("/users", userRouter);
  app.use("/messages", messageRouter);

  app.use("{/*demo}", (req, res, next) => {
    throw new Error(`The URL ${req.originalUrl} Is Not Found 😥`, {
      cause: 500,
    });
  });

  app.use((err, req, res, next) => {
    // console.error(err.stack);
    res.status(err.cause || 500).json({message: err.message, stack: err.stack});
  });

  app.listen(PORT, () => console.log(`Saraha app listening on port ${PORT}!`));
};
export default bootstrap;
