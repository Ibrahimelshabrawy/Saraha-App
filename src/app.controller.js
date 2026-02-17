import express from "express";
import checkConnection from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
const app = express();
const port = 3000;

const bootstrap = () => {
  app.use(express.json());
  app.get("/", (req, res) => res.send("Hello World!"));
  checkConnection();

  app.use("/users", userRouter);
  app.use("{/*demo}", (req, res, next) => {
    throw new Error("`The URL ${req.originalUrl} Is Not Found 😥`", {
      cause: 500,
    });
  });

  app.use((err, req, res, next) => {
    // console.error(err.stack);
    res.status(err.cause || 500).json({message: err.message, stack: err.stack});
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
export default bootstrap;
