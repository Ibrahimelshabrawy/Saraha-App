import {Router} from "express";
import * as US from "./user.services.js";
import {authentication} from "../../common/middleware/Auth/authentication.js";
// import {authorization} from "../../common/middleware/Auth/authorization.js";
import {RoleEnum} from "../../common/enum/user.enum.js";

const userRouter = Router();
userRouter.post("/signup", US.signUp);
userRouter.post("/signin", US.signIn);
userRouter.get("/profile", authentication, US.getProfile);
export default userRouter;
