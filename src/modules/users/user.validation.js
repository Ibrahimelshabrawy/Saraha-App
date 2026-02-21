import joi from "joi";
import {GenderEnum, RoleEnum} from "../../common/enum/user.enum.js";

export const signinSchema = {
  body: joi
    .object()
    .keys({
      email: joi
        .string()
        .email({
          maxDomainSegments: 3,
          minDomainSegments: 2,
          tlds: {allow: ["com", "edu", "net"]},
        })
        .trim()
        .required(),
      password: joi.string().min(6).max(25).required(),
    })
    .required(),
};
export const signUpSchema = {
  body: signinSchema.body
    .append({
      userName: joi.string().min(3).max(50).trim().required(), // RegExp مش هتشتغل محتاجه
      cPassword: joi.string().valid(joi.ref("password")).required(),
      phone: joi.string().length(11).required(),
      role: joi.array().items(RoleEnum.admin, RoleEnum.user),
      gender: joi.array().items(GenderEnum.female, GenderEnum.male),
      confirm: joi.boolean().truthy(1, "1").falsy(0, "0"),
      profilePicture: joi.string(),
    })
    .required(),
};
