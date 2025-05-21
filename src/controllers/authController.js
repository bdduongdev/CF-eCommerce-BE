import User from "../models/user.js";
import PasswordReset from "../models/passwordReset.js";
import EmailVerification from "../models/emailVerification.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import { generateToken, generateRefreshToken } from "../utils/jwt.js";
import { JWT_SECRET, JWT_REFRESH_SECRET, FRONTEND_URL, RESET_PASSWORD_EXPIRES } from "../configs/enviroments.js";
import { sendEmail } from "../utils/sendMail.js";
import { generateResetToken } from "../utils/handleOTP.js";

const login = handleAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(createError(400, "Email và mật khẩu là bắt buộc"));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(createError(401, "Email hoặc mật khẩu không đúng"));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        return next(createError(401, "Email hoặc mật khẩu không đúng"));
    }

    if (!user.isVerified) {
        return next(createError(401, "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản."));
    }

    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

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

const register = handleAsync(async (req, res, next) => {
    const { fullname, email, password, confirmPassword, phone, address } = req.body;

    if (!fullname || !email || !password || !confirmPassword) {
        return next(createError(400, "Họ tên, email, mật khẩu và xác nhận mật khẩu là bắt buộc"));
    }

    if (password !== confirmPassword) {
        return next(createError(400, "Mật khẩu và xác nhận mật khẩu không khớp"));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(createError(400, "Email này đã được sử dụng"));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(createError(400, "Email không hợp lệ"));
    }

    if (password.length < 6) {
        return next(createError(400, "Mật khẩu phải có ít nhất 6 ký tự"));
    }

    if (phone) {
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return next(createError(400, "Số điện thoại không hợp lệ"));
        }
    }

    const newUser = await User.create({
        fullname,
        email,
        password,
        phone: phone || "",
        address: address || "",
        role: "customer",
        isVerified: false
    });

    const verificationToken = generateResetToken();
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    await EmailVerification.create({
        userId: newUser._id,
        email: newUser.email,
        token: verificationToken,
        expires: verificationExpires
    });
    
    const message = `
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
        await sendEmail(newUser.email, "Xác thực tài khoản", message);
        
        const accessToken = generateToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        const { password: userPassword, ...userWithoutPassword } = newUser.toObject();

        res.status(201).json({
            success: true,
            data: {
                user: userWithoutPassword,
                accessToken,
                refreshToken
            },
            message: "Đăng ký tài khoản thành công. Vui lòng kiểm tra email để xác thực tài khoản."
        });
    } catch (error) {
        console.error("Lỗi gửi email xác thực:", error);
        const accessToken = generateToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        const { password: userPassword, ...userWithoutPassword } = newUser.toObject();

        res.status(201).json({
            success: true,
            data: {
                user: userWithoutPassword,
                accessToken,
                refreshToken
            },
            message: "Đăng ký tài khoản thành công nhưng không thể gửi email xác thực."
        });
    }
});

const verifyEmail = handleAsync(async (req, res, next) => {
    const { verificationToken } = req.body;
    
    const emailVerification = await EmailVerification.findOne({
        token: verificationToken,
        expires: { $gt: Date.now() },
        isUsed: false
    });
    
    if (!emailVerification) {
        return next(createError(400, "Mã xác thực không hợp lệ hoặc đã hết hạn"));
    }
    
    // Tìm user và cập nhật trạng thái xác thực
    const user = await User.findById(emailVerification.userId);
    if (!user) {
        return next(createError(404, "Không tìm thấy tài khoản người dùng"));
    }
    
    // Cập nhật trạng thái xác thực
    user.isVerified = true;
    await user.save();
    
    // Đánh dấu token đã được sử dụng
    emailVerification.isUsed = true;
    await emailVerification.save();
    
    res.status(200).json({
        success: true,
        message: "Xác thực email thành công"
    });
});

const forgotPassword = handleAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(createError(400, "Email là bắt buộc"));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(createError(404, "Không tìm thấy tài khoản với email này"));
    }

    const resetToken = generateResetToken();
    const resetExpires = Date.now() + parseInt(RESET_PASSWORD_EXPIRES);

    await PasswordReset.create({
        userId: user._id,
        email: user.email,
        token: resetToken,
        expires: resetExpires
    });
    
    const message = `
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
        console.log("Token reset:", resetToken); // Thay resetUrl bằng resetToken
        await sendEmail(user.email, "Đặt lại mật khẩu", message);
        
        res.status(200).json({
            success: true,
            message: "Email đặt lại mật khẩu đã được gửi"
        });
    } catch (error) {
        console.error("Lỗi gửi email:", error);
        // Xóa token nếu không gửi được email
        await PasswordReset.deleteOne({ token: resetToken });
        
        return next(createError(500, "Không thể gửi email đặt lại mật khẩu"));
    }
});

const validateResetToken = handleAsync(async (req, res, next) => {
    const { resetToken } = req.params;
    console.log("Token nhận được:", resetToken);
    
    const passwordReset = await PasswordReset.findOne({
        token: resetToken,
        expires: { $gt: Date.now() },
        isUsed: false
    });
    
    console.log("Kết quả tìm kiếm:", passwordReset);
    
    if (!passwordReset) {
        return next(createError(400, "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"));
    }
    
    res.status(200).json({
        success: true,
        message: "Token hợp lệ",
        data: {
            email: passwordReset.email
        }
    });
});

const resetPassword = handleAsync(async (req, res, next) => {
    const { resetToken } = req.params;
    const { password, confirmPassword } = req.body;
    
    if (!password || !confirmPassword) {
        return next(createError(400, "Mật khẩu và xác nhận mật khẩu là bắt buộc"));
    }
    
    if (password !== confirmPassword) {
        return next(createError(400, "Mật khẩu và xác nhận mật khẩu không khớp"));
    }
    
    if (password.length < 6) {
        return next(createError(400, "Mật khẩu phải có ít nhất 6 ký tự"));
    }
    
    const passwordReset = await PasswordReset.findOne({
        token: resetToken,
        expires: { $gt: Date.now() },
        isUsed: false
    });
    
    if (!passwordReset) {
        return next(createError(400, "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"));
    }
    
    const user = await User.findById(passwordReset.userId);
    if (!user) {
        return next(createError(404, "Không tìm thấy tài khoản người dùng"));
    }
    
    user.password = password;
    await user.save();
    
    // Đánh dấu token đã được sử dụng
    passwordReset.isUsed = true;
    await passwordReset.save();
    
    res.status(200).json({
        success: true,
        message: "Mật khẩu đã được đặt lại thành công"
    });
});

const logout = handleAsync(async (req, res, next) => {
const authHeader = req.headers.authorization;
const token = authHeader && authHeader.split(' ')[1];

if (!token) {
    return next(createError(401, "Bạn chưa đăng nhập"));
}

res.status(200).json({
    success: true,
    message: "Đăng xuất thành công"
    });
});

export {
login,
register,
verifyEmail,
forgotPassword,
validateResetToken,
resetPassword,
logout
};