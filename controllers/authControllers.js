import * as authServices from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import compareHash from "../helpers/compareHash.js";
import { createToken } from "../helpers/jwt.js";
import gravatar from "gravatar";
import jimp from "jimp";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import sendEmail from "../helpers/sendEmail.js";

const avatarsPath = path.resolve("public", "avatars");

const signup = async (req, res) => {
    const {email} = req.body;
    const avatarURL = gravatar.url(email,  { s: '250', r: 'g', d: 'wavatar' });

    const user = await authServices.findUser({email});
    if(user) {
        throw HttpError(409, "Email in use");
    }

    const verificationToken = nanoid();

    const newUser = await authServices.saveUser({...req.body, avatarURL, verificationToken});

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Click to verify your email</a>`,
    }

    await sendEmail(verifyEmail);

    res.status(201).json({
        user: {
            email: newUser.email,
            subscription: newUser.subscription,
            avatarURL: newUser.avatarURL,
        }
    })
}

const verify = async (req, res) => {
    const {verificationToken} = req.params;
    const user = await authServices.findUser({verificationToken});
    if(!user) {
        throw HttpError(404, "User not found");
    }

    await authServices.updateUser({_id: user._id}, {verify: true, verificationToken: ""});

    res.status(200).json({
        message: "Verification successful"
    })
}

const resendVerify = async(req, res) => {
    const {email} = req.body;
    const user = await authServices.findUser({email});

    if(!user) {
        throw HttpError(404, "User not found");
    }

    if(user.verify) {
        throw HttpError(400, "Verification has already been passed");
    }

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${user.verificationToken}">Click to verify your email</a>`,
    }

    await sendEmail(verifyEmail);

    res.json ({
        message: "Verification email sent"
    })
}

const signin = async(req, res) => {
    const {email, password} = req.body;
    const user = await authServices.findUser({email});
    if(!user) {
        throw HttpError(401, "Email or password is wrong")
    }
    
    if (!user.verify) {
        throw HttpError(401, "Email not verified");
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
};

const updateAvatar = async (req, res) => {
    if (!req.file) {
        throw HttpError(400, "File not provided");
    }

    const { path: tempPath, filename } = req.file;
    const newPath = path.join(avatarsPath, filename);
    await fs.rename(tempPath, newPath);

    const image = await jimp.read(newPath);
    await image.resize(250, 250).writeAsync(newPath);

    const avatarURL = path.join("avatars", filename);
    const { _id } = req.user;
    const updatedUser = await authServices.updateUser({ _id }, { avatarURL });

    res.json({ avatarURL: updatedUser.avatarURL });
};


export default {
    signup: ctrlWrapper(signup),
    verify: ctrlWrapper(verify),
    resendVerify: ctrlWrapper(resendVerify),
    signin: ctrlWrapper(signin),
    getCurrent: ctrlWrapper(getCurrent),
    signout: ctrlWrapper(signout),
    updateSubscription: ctrlWrapper(updateSubscription),
    updateAvatar: ctrlWrapper(updateAvatar),
}
