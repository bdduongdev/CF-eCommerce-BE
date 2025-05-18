import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../configs/enviroments.js";

// Đăng nhập
const login = handleAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Kiểm tra email và password có được cung cấp không
    if (!email || !password) {
        return next(createError(400, "Email và mật khẩu là bắt buộc"));
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
        return next(createError(401, "Email hoặc mật khẩu không đúng"));
    }

    // Kiểm tra mật khẩu
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        return next(createError(401, "Email hoặc mật khẩu không đúng"));
    }

    // Tạo access token
    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
    );

    // Tạo refresh token
    const refreshToken = jwt.sign(
        { id: user._id },
        JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    // Loại bỏ password trước khi gửi response
    const { password: userPassword, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
        success: true,
        data: {
            user: userWithoutPassword,
            accessToken,
            refreshToken
        },
        message: "Đăng nhập thành công"
    });
});

export { login };