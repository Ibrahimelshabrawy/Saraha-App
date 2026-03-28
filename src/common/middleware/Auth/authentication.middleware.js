import {ACCESS_SECRET_KEY} from "../../../../config/config.service.js";
import * as db_service from "../../../DB/db.services.js";
import * as redis_service from "../../../DB/redis/redis.services.js";
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

  const verify = VerifyToken({token, secret_key: ACCESS_SECRET_KEY});
  if (!verify || !verify?.id) {
    throw new Error("Invalid Token");
  }

  const user = await db_service.findOne({
    model: userModel,
    filter: {_id: verify.id},
  });

  if (!user) {
    throw new Error("User Not Found", {cause: 404});
  }

  // This for logout from all devices
  if (user?.changeCredential?.getTime() > verify.iat * 1000) {
    throw new Error("Invalid Token session", {cause: 403});
  }

  // This for logout from only one device

  // Search In Cache
  const revokeToken = await redis_service.get(
    redis_service.revokeKey({
      userId: user._id,
      jti: verify.jti,
    }),
  );
  if (revokeToken) {
    throw new Error("Invalid Revoke Token For This Device", {cause: 403});
  }

  req.user = user;
  req.verify = verify;

  next();
};
