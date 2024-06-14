import * as authServices from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import compareHash from "../helpers/compareHash.js";
import { createToken } from "../helpers/jwt.js";

const signup = async (req, res) => {
    const {email} = req.body;
    const user = await authServices.findUser({email});
    if(user) {
        throw HttpError(409, "Email in use");
    }
    const newUser = await authServices.saveUser(req.body);

    res.status(201).json({
        user: {
        email: newUser.email,
        subscription: newUser.subscription,
        }
    })
}

const signin = async(req, res) => {
    const {email, password} = req.body;
    const user = await authServices.findUser({email});
    if(!user) {
        throw HttpError(401, "Email or password is wrong")
    }
    const comparePassword = await compareHash(password, user.password);
    if(!comparePassword) {
        throw HttpError(401, "Email or password is wrong");
    }

    const {_id: id} = user;
    const payload = {
        id,
    };

    const token = createToken(payload);
    await authServices.updateUser({_id: id}, {token});


    res.json({
        token,
        user: {
            email: user.email,
            subscription: user.subscription,
            }
    })
}

const getCurrent = (req, res) => {
    const {email, subscription} = req.user;

    res.json({
        email,
        subscription,
    })
}

const signout = async (req, res) => {
    const {_id} = req.user;
   
    await authServices.updateUser({_id}, {token: ""});

    res.status(204).send();
}

const updateSubscription = async (req, res) => {
    const { _id } = req.user;
    const { subscription } = req.body;
    const updatedUser = await authServices.updateUser({ _id }, { subscription }); 
    if (!updatedUser) {
        throw HttpError(404, "User not found");
    }
    res.json({
        message: "Subscription update success",
        subscription: updatedUser.subscription,
    });
}

export default {
    signup: ctrlWrapper(signup),
    signin: ctrlWrapper(signin),
    getCurrent: ctrlWrapper(getCurrent),
    signout: ctrlWrapper(signout),
    updateSubscription: ctrlWrapper(updateSubscription),
}
