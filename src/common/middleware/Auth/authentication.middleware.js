import {SECRET_KEY} from "../../../../config/config.service.js";
import * as db_service from "../../../DB/db.services.js";
import userModel from "../../../DB/models/user.model.js";
import {VerifyToken} from "../../utils/jwt/token.service.js";
import {decrypt} from "../../utils/Security/encryption.security.js";

export const authentication = async (req, res, next) => {
  const {authorization} = req.headers;

  if (!authorization) {
    throw new Error("token is required");
  }

  const [prefix, token] = authorization.split(" ");
  if (prefix !== "bearer") {
    throw new Error("Invalid prefix");
  }

  const verify = VerifyToken({token, secret_key: SECRET_KEY});
  if (!verify || !verify?.id) {
    throw new Error("Invalid Token");
  }

  const user = await db_service.findOne({
    model: userModel,
    select: "-password",
    filter: {_id: verify.id},
    options: {
      lean: true,
    },
  });

  if (!user) {
    throw new Error("User Not Found", {cause: 404});
  }

  user.phone = await decrypt(user.phone);

  req.user = user;
  next();
};
