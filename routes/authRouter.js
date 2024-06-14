import express from "express";
import authControllers from "../controllers/authControllers.js";
import isEmptyBody from "../middlewares/isEmptyBody.js";
import validateBody from "../decorators/validateBody.js";
import { authSignupSchema, authSigninSchema, subscriptionSchema, authEmailSchema } from "../schemas/authSchemas.js";
import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post("/register", upload.single("avatar"), isEmptyBody, validateBody(authSignupSchema), authControllers.signup);

authRouter.get("/verify/:verificationToken", authControllers.verify);

authRouter.post("/verify", isEmptyBody, validateBody(authEmailSchema), authControllers.resendVerify);

authRouter.post("/login", isEmptyBody, validateBody(authSigninSchema), authControllers.signin);

authRouter.get("/current", authenticate, authControllers.getCurrent);

authRouter.post("/logout", authenticate, authControllers.signout);

authRouter.patch("/", authenticate, validateBody(subscriptionSchema), authControllers.updateSubscription );

authRouter.patch("/avatars", authenticate, upload.single("avatar"), authControllers.updateAvatar);

export default authRouter;