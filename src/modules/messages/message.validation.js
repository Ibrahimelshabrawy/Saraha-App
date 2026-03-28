import joi from "joi";
import {GeneralRules} from "../../common/utils/helpers/generalRules.validation.js";

export const sendMessageSchema = {
  body: joi
    .object({
      content: joi.string().min(1).required(),
      userId: GeneralRules.id.required(),
      messagePhotos: joi.array().items(GeneralRules.file),
    })
    .required()
    .messages({
      "any.required": "Please Enter The Body/Form Values",
    }),
};

export const getMessageSchema = {
  params: joi
    .object({
      messageId: GeneralRules.id.required(),
    })
    .required()
    .messages({
      "any.required": "Please Enter The Params Value",
    }),
};
