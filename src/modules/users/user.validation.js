import joi from "joi";
import {GeneralRules} from "../../common/utils/helpers/generalRules.validation.js";

export const signinSchema = {
  body: joi
    .object()
    .keys({
      email: GeneralRules.email.required(),
      password: GeneralRules.password.required(),
    })
    .required()
    .messages({
      "any.required": "Body is required",
    }),
};
export const signUpSchema = {
  body: signinSchema.body
    .append({
      userName: GeneralRules.userName.required(),
      cPassword: joi.string().valid(joi.ref("password")).messages({
        "any.required": "Confirm Password is required",
      }),
      phone: GeneralRules.phone.required(),
      role: GeneralRules.role,
      gender: GeneralRules.gender,
      confirm: GeneralRules.confirm,
      profilePicture: GeneralRules.profilePicture,
    })
    .required()
    .messages({
      "any.required": "Body is required",
    }),
  // file: GeneralRules.file.required(),
  files: joi.object({
    attachments: joi.array().items(GeneralRules.file),
    attachment: joi.array().items(GeneralRules.file),
  }),
};

export const shareProfileSchema = {
  params: GeneralRules.id.required(),
};
export const updateProfileSchema = {
  body: joi
    .object({
      gender: GeneralRules.gender,
      phone: GeneralRules.phone,
      firstName: GeneralRules.firstName,
      lastName: GeneralRules.lastName,
    })
    .required()
    .messages({
      "any.required": "Body is required",
    }),
  params: GeneralRules.id.required(),
};

export const updatePasswordSchema = {
  body: joi
    .object({
      oldPassword: GeneralRules.password.required(),
      newPassword: GeneralRules.password.required(),
      cPassword: joi
        .string()
        .valid(joi.ref("newPassword"))
        .required()
        .messages({
          "any.only": "Confirm Password Must Be Similar To Password",
          "string.empty": "Confirm Password Cannot Be Empty",
        }),
    })
    .required(),
};

export const coverImagesSchema = {
  files: joi.array().items(GeneralRules.file.required()).messages({
    "array.base": "Please Send images",
  }),
};
export const profileImageSchema = {
  file: GeneralRules.file.required(),
};
