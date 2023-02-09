import User from "../models/User.js";
import Post from "../models/Post.js";
import Idea from "../models/Idea.js";
import Fund from "../models/Fund.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import ApiFeatures from "../utils/apifeatures.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";

//Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// WhoAmI
export const whoami = async (req, res) => {
  try {
    const cookie = req.headers.cookie;
    //console.log(cookie);
    res.set("Access-Control-Allow-Origin", "*");
    //res.setHeader("Access-Control-Allow-Credentials", true);
    if (!cookie) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }
    const token = cookie
      .split(";")
      .find((c) => c.trim().startsWith("inventum="));

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Who are you? You Degenerate at token 1",
      });
    }

    const tokenWithoutPrefix = token.split("=")[1];
    if (!tokenWithoutPrefix) {
      return res.status(401).json({
        success: false,
        error: "Who are you? You Degenerate at token 2",
      });
    }

    const decoded = await jwt.verify(
      tokenWithoutPrefix,
      process.env.JWT_SECRET
    );

    res.status(200).json({
      success: true,
      user: decoded,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    res.set("Access-Control-Allow-Origin", "*");
    //res.setHeader("Access-Control-Allow-Credentials", true);

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }
    delete user.password;

    const payload = { ...user._doc };

    //console.log(payload, "payload");

    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("inventum", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax",
        maxAge: 10 * 24 * 60 * 60,
        path: "/",
      })
    );

    res.json({
      success: true,
      message: "Login success",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Logout
export const logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("inventum", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .json({
        success: true,
        message: "Logged out",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



//Forget Password
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetPasswordToken = user.getResetPasswordToken();

    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/user/password/reset/${resetPasswordToken}`;

    const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password",
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Reset Password
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Reset Password Token is invalid or has been expired",
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(createError(400, "Password does not password"));
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};