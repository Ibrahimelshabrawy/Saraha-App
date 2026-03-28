import {Router} from "express";
import {multer_local} from "../../common/middleware/multer/multer.js";
import {MulterEnum} from "../../common/enum/multer.enum.js";
import validation from "../../common/middleware/validation/validation.middleware.js";
import * as MV from "./message.validation.js";
import * as MS from "./message.service.js";
import {authentication} from "../../common/middleware/Auth/authentication.middleware.js";

const messageRouter = Router();

messageRouter.post(
  "/send",
  multer_local({custom_types: [...MulterEnum.image]}).array("messagePhotos"),
  validation(MV.sendMessageSchema),
  MS.sendMessage,
);

messageRouter.get(
  "/:messageId",
  authentication,
  validation(MV.getMessageSchema),
  MS.getMessage,
);

messageRouter.get("/", authentication, MS.getMessages);

export default messageRouter;
