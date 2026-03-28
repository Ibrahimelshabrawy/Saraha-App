import path from "node:path";
import * as db_service from "../../DB/db.services.js";
import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/user.model.js";
import {successResponse} from "../../common/utils/response/success.response.js";

export const sendMessage = async (req, res, next) => {
  const {content, userId} = req.body;

  const attachments = req.files.map((file) =>
    path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
  );

  const user = await db_service.findById({
    model: userModel,
    id: userId,
  });
  if (!user) {
    throw new Error("User Not Exist", {cause: 404});
  }

  const message = await db_service.create({
    model: messageModel,
    data: {
      content,
      userId: user._id,
      attachments,
    },
  });
  successResponse({
    res,
    message: "Message Sent Successfuly 🥳🥳",
    status: 201,
    data: message,
  });
};

export const getMessage = async (req, res, next) => {
  const {messageId} = req.params;

  console.log(messageId);

  const message = await db_service.findById({
    model: messageModel,
    id: messageId,
  });
  console.log(message);

  if (!message) {
    throw new Error("message Not Found", {cause: 404});
  }

  successResponse({
    res,
    message: "Message Fetched Successfuly 🥳🥳",
    status: 201,
    data: message,
  });
};

export const getMessages = async (req, res, next) => {
  const messages = await db_service.find({
    model: messageModel,
  });

  if (messages.length == 0) {
    throw new Error("There Is No Messages", {cause: 404});
  }
  successResponse({
    res,
    status: 200,
    message: "Messages Fetched Successfully🥳🥳",
    data: messages,
  });
};
