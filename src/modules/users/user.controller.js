import {Router} from "express";
import * as US from "./user.services.js";
import {authentication} from "../../common/middleware/Auth/authentication.middleware.js";
// import {authorization} from "../../common/middleware/Auth/authorization.js";
import {RoleEnum} from "../../common/enum/user.enum.js";
import {authorization} from "../../common/middleware/Auth/authorization.middleware.js";
import {validation} from "../../common/middleware/validation/validation.middleware.js";
import * as UV from "./user.validation.js";

const userRouter = Router();
userRouter.post("/signup", validation(UV.signUpSchema), US.signUp);
userRouter.post("/signup/gmail", US.signUpWithGmail);
userRouter.post("/signin", validation(UV.signinSchema), US.signIn);
userRouter.get(
  "/profile",
  authentication,
  authorization([RoleEnum.admin]),
  US.getProfile,
);

export default userRouter;
