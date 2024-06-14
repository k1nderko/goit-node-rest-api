import express from "express";
import authControllers from "../controllers/authControllers.js";
import isEmptyBody from "../middlewares/isEmptyBody.js";
import validateBody from "../decorators/validateBody.js";
import { authSignupSchema, authSigninSchema, subscriptionSchema } from "../schemas/authSchemas.js";
import authenticate from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", isEmptyBody, validateBody(authSignupSchema), authControllers.signup);

authRouter.post("/login", isEmptyBody, validateBody(authSigninSchema), authControllers.signin);

authRouter.get("/current", authenticate, authControllers.getCurrent);

authRouter.post("/logout", authenticate, authControllers.signout);

authRouter.patch("/", authenticate, validateBody(subscriptionSchema), authControllers.updateSubscription )

export default authRouter;