const Users = require("../repositories/users");
const { HttpCode } = require("../helpers/constans");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const path = require("path");
const EmailService = require("../services/email");
const { CreateSenderSendGrid } = require("../services/email-sender");
require("dotenv").config();
const UploadAvatarService = require("../services/local-upload");
const SECRET_KEY = process.env.SECRET_KEY;

const register = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email);

    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: "error",
        code: HttpCode.CONFLICT,
        message: "Email is already used",
      });
    }
    const { id, email, subscription, avatar, verifyToken } = await Users.create(
      req.body
    );

     try {
       const emailService = new EmailService(
         process.env.NODE_ENV,
         new CreateSenderSendGrid()
       );

       await emailService.sendVerifyEmail(verifyToken, email);
     } catch (error) {
       console.log(error.message);
     }
    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      data: { id, email, subscription, avatar },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email);
    const isValidPassword = await user?.isValidPassword(req.body.password);

    if (!user || !isValidPassword || !user.verify) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "error",
        code: HttpCode.UNAUTHORIZED,
        message: "Invalid credentials",
      });
    }
    const id = user.id;
    const payload = { id, test: "nodejs" };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });
    await Users.updateToken(id, token);
    return res
      .status(OK)
      .json({ status: "success", code: OK, data: { token } });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const id = req.user.id;
    await Users.updateToken(id, null);
    return res.status(NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
};

const current = async (req, res, next) => {
  try {
    const id = req.user.id;
    const user = await Users.findById(id);
    const { email, subscription } = user;

    return res.status(HttpCode.OK).json({
      status: `${HttpCode.OK} OK`,
      code: HttpCode.OK,
      data: {
        user: {
          email,
          subscription,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const subscription = async (req, res, next) => {
  try {
    const id = req.user.id;
    const user = await Users.updateSubscription(id, req.body);
    const { email, subscription } = user;

    return res.status(HttpCode.OK).json({
      status: `${HttpCode.OK} success`,
      code: HttpCode.OK,
      data: {
        user: {
          email,
          subscription,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const avatars = async (req, res, next) => {
  try {
    const id = req.user.id;
    const uploads = new UploadAvatarService(process.env.AVATAR_OF_USERS);
    const avatarUrl = await uploads.saveAvatar({ idUser: id, file: req.file });
    try {
      await fs.unlink(
        path.join(
          process.env.UPLOAD_DIR,
          process.env.AVATAR_OF_USERS,
          req.user.avatar
        )
      );
    } catch (e) {
      console.log(e.message);
    }

    await Users.updateAvatar(id, avatarUrl);
    res.json({
      status: "success",
      code: 200,
      data: { avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const user = await Users.findByVerifyToken(req.params.verificationToken);
    if (user) {
      await Users.updateTokenVerify(user.id, true, null);

      return res.json({
        status: "success",
        code: HttpCode.OK,
        data: {
          message: "Success",
        },
      });
    }

    return res.status(HttpCode.BAD_REQUEST).json({
      status: `${HttpCode.BAD_REQUEST} not found`,
      message: "Verification token isn't valid",
    });
  } catch (error) {
    next(error);
  }
};

const repeatEmailVerification = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email);

    if (user) {
      const { email, verify, verifyToken } = user;

      if (!verify) {
        const emailService = new EmailService(
          process.env.NODE_ENV,
          new CreateSenderSendGrid()
        );

        await emailService.sendVerifyEmail(verifyToken, email);

        return res.json({
          status: "success",
          code: HttpCode.OK,
          data: {
            message: "Resubmitted success",
          },
        });
      }

      return res.status(HttpCode.CONFLICT).json({
        status: "error",
        code: HttpCode.CONFLICT,
        message: "Email has been verified",
      });
    }

    return res.status(HttpCode.NOT_FOUND).json({
      status: "error",
      code: HttpCode.NOT_FOUND,
      message: "User not found",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  current,
  subscription,
  avatars,
  verify,
  repeatEmailVerification,
};
