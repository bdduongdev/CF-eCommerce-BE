import User from "../models/User.js";
import PasswordReset from "../models/PasswordResetToken.js";
import EmailVerification from "../models/EmailVerification.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import { generateToken, generateRefreshToken } from "../utils/jwt.js";
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  FRONTEND_URL,
  RESET_PASSWORD_EXPIRES,
} from "../configs/enviroments.js";
import { sendEmail } from "../utils/sendMail.js";
import { generateResetToken } from "../utils/handleOTP.js";
import message from "../constants/index.js";

const login = handleAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(createError(401, message.AUTH.INVALID_CREDENTIALS));
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return next(createError(401, message.AUTH.INVALID_CREDENTIALS));
  }

  if (!user.isVerified) {
    return next(createError(401, message.AUTH.ACCOUNT_NOT_VERIFIED));
  }

  const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const { password: userPassword, ...userWithoutPassword } = user.toObject();

  res.status(200).json({
    success: true,
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    },
    message: message.AUTH.LOGIN_SUCCESS,
  });
});

const register = handleAsync(async (req, res, next) => {
  const { fullname, email, password, phone, address } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(createError(400, message.AUTH.EMAIL_IN_USE));
  }

  const newUser = await User.create({
    fullname,
    email,
    password,
    phone: phone || "",
    address: address || "",
    role: "customer",
    isVerified: false,
  });

  const verificationToken = generateResetToken();
  const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  await EmailVerification.create({
    userId: newUser._id,
    email: newUser.email,
    token: verificationToken,
    expires: verificationExpires,
  });

  const emailMessage = `
        Xin chào ${newUser.fullname},
        
        Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã xác thực sau để xác minh tài khoản của bạn:
        
        ${verificationToken}
        
        Mã xác thực này sẽ hết hạn sau 24 giờ.
        
        Trân trọng,
        Đội ngũ hỗ trợ
    `;

  try {
    console.log("Đang gửi email xác thực đến:", newUser.email);
    console.log("Token xác thực:", verificationToken);
    await sendEmail(newUser.email, "Xác thực tài khoản", emailMessage);

    const accessToken = generateToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    const { password: userPassword, ...userWithoutPassword } =
      newUser.toObject();

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      message: message.AUTH.REGISTER_SUCCESS_WITH_VERIFICATION,
    });
  } catch (error) {
    console.error("Lỗi gửi email xác thực:", error);
    const accessToken = generateToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    const { password: userPassword, ...userWithoutPassword } =
      newUser.toObject();

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      message: message.AUTH.REGISTER_SUCCESS_WITHOUT_VERIFICATION,
    });
  }
});

const verifyEmail = handleAsync(async (req, res, next) => {
  const { verificationToken } = req.body;

  const emailVerification = await EmailVerification.findOne({
    token: verificationToken,
    expires: { $gt: Date.now() },
    isUsed: false,
  });

  if (!emailVerification) {
    return next(createError(400, message.AUTH.INVALID_VERIFICATION_TOKEN));
  }

  const user = await User.findById(emailVerification.userId);
  if (!user) {
    return next(createError(404, message.AUTH.USER_ACCOUNT_NOT_FOUND));
  }

  user.isVerified = true;
  await user.save();

  emailVerification.isUsed = true;
  await emailVerification.save();

  res.status(200).json({
    success: true,
    message: message.AUTH.EMAIL_VERIFICATION_SUCCESS,
  });
});

const forgotPassword = handleAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(createError(404, message.AUTH.EMAIL_NOT_FOUND));
  }

  const resetToken = generateResetToken();
  const resetExpires = Date.now() + parseInt(RESET_PASSWORD_EXPIRES);

  await PasswordReset.create({
    userId: user._id,
    email: user.email,
    token: resetToken,
    expires: resetExpires,
  });

  const emailMessage = `
        Xin chào ${user.fullname},
        
        Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng sử dụng mã xác thực sau để đặt lại mật khẩu:
        
        ${resetToken}
        
        Mã xác thực này sẽ hết hạn sau 1 giờ.
        
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        
        Trân trọng,
        Đội ngũ hỗ trợ
    `;

  try {
    console.log("Đang gửi email đến:", user.email);
    console.log("Token reset:", resetToken);
    await sendEmail(user.email, "Đặt lại mật khẩu", emailMessage);

    res.status(200).json({
      success: true,
      message: message.AUTH.RESET_EMAIL_SENT,
    });
  } catch (error) {
    console.error("Lỗi gửi email:", error);

    await PasswordReset.deleteOne({ token: resetToken });

    return next(createError(500, message.AUTH.RESET_EMAIL_FAILED));
  }
});

const validateResetToken = handleAsync(async (req, res, next) => {
  const { resetToken } = req.params;
  console.log("Token nhận được:", resetToken);

  const passwordReset = await PasswordReset.findOne({
    token: resetToken,
    expires: { $gt: Date.now() },
    isUsed: false,
  });

  console.log("Kết quả tìm kiếm:", passwordReset);

  if (!passwordReset) {
    return next(createError(400, message.AUTH.INVALID_RESET_TOKEN));
  }

  res.status(200).json({
    success: true,
    message: message.AUTH.RESET_TOKEN_VALID,
    data: {
      email: passwordReset.email,
    },
  });
});

const resetPassword = handleAsync(async (req, res, next) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  const passwordReset = await PasswordReset.findOne({
    token: resetToken,
    expires: { $gt: Date.now() },
    isUsed: false,
  });

  if (!passwordReset) {
    return next(createError(400, message.AUTH.INVALID_RESET_TOKEN));
  }

  const user = await User.findById(passwordReset.userId);
  if (!user) {
    return next(createError(404, message.AUTH.USER_ACCOUNT_NOT_FOUND));
  }

  user.password = password;
  await user.save();

  passwordReset.isUsed = true;
  await passwordReset.save();

  res.status(200).json({
    success: true,
    message: message.AUTH.PASSWORD_RESET_SUCCESS,
  });
});

const logout = handleAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(createError(401, message.AUTH.NOT_LOGGED_IN));
  }

  res.status(200).json({
    success: true,
    message: message.AUTH.LOGOUT_SUCCESS,
  });
});

export {
  login,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  logout,
};
