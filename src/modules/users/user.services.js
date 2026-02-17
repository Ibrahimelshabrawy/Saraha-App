import {hashSync, compareSync} from "bcrypt";
import {ProviderEnum} from "../../common/enum/user.enum.js";
import {successResponse} from "../../common/utils/response/success.response.js";
import * as db_service from "../../DB/db.services.js";
import userModel from "../../DB/models/user.model.js";
import {
  compare_match,
  Hash,
} from "../../common/utils/Security/hash.security.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/Security/encryption.security.js";
import jwt from "jsonwebtoken";
import {v4 as uuidv4} from "uuid";
import {
  GenerateToken,
  VerifyToken,
} from "../../common/utils/jwt/token.service.js";

export const signUp = async (req, res, next) => {
  const {userName, email, cPassword, password, gender, provider, phone} =
    req.body;
  if (cPassword !== password) {
    throw new Error("Invalid Password", {cause: 400});
  }
  if (await db_service.findOne({model: userModel, filter: {email}})) {
    throw new Error("Email Already Exist", {cause: 409});
  }
  const user = await db_service.create({
    model: userModel,
    data: {
      userName,
      email,
      cPassword,
      password: await Hash({plainText: password, salt_rounds: 12}),
      gender,
      provider,
      phone: await encrypt(phone),
    },
  });
  successResponse({
    res,
    message: "Sign In Successfully Enjoy 🥳",
    status: 200,
    data: user,
  });
};

export const signIn = async (req, res, next) => {
  const {email, password} = req.body;
  const user = await db_service.findOne({
    model: userModel,
    filter: {email, provider: ProviderEnum.system},
    options: {lean: true},
  });

  if (!user) {
    throw new Error("User Not Found", {cause: 404});
  }

  if (
    !(await compare_match({plainText: password, cipherText: user.password}))
  ) {
    throw new Error("Invalid Password", {cause: 400});
  }

  const access_token = GenerateToken({
    payload: {id: user._id},
    secret_key: "ibrahim",
  });

  successResponse({
    res,
    message: "Sign In Successfully Enjoy 🥳",
    status: 200,
    data: {access_token},
  });
};

export const getProfile = async (req, res, next) => {
  successResponse({
    res,
    status: 200,
    message: "User Profile",
    data: req.user,
  });
};
