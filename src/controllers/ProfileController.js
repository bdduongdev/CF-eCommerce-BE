import User from "../models/User.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import bcrypt from "bcrypt";
import message from "../constants/index.js";

const getProfile = handleAsync(async (req, res, next) => {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
        return next(createError(404, "Không tìm thấy người dùng"));
    }

    res.status(200).json({
        success: true,
        data: user,
        message: message.USER?.GET_PROFILE_SUCCESS || "Lấy thông tin người dùng thành công"
    });
});

const updateProfile = handleAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { 
        fullname, 
        phone, 
        address,
        dateOfBirth,
        gender,
        detailedAddress
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        return next(createError(404, "Không tìm thấy người dùng"));
    }

    if (fullname) user.fullname = fullname;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    
    if (detailedAddress) {
        if (!user.detailedAddress) {
            user.detailedAddress = {};
        }
        if (detailedAddress.street) user.detailedAddress.street = detailedAddress.street;
        if (detailedAddress.ward) user.detailedAddress.ward = detailedAddress.ward;
        if (detailedAddress.district) user.detailedAddress.district = detailedAddress.district;
        if (detailedAddress.city) user.detailedAddress.city = detailedAddress.city;
        if (detailedAddress.country) user.detailedAddress.country = detailedAddress.country;
    }

    user.updated_at = new Date();
    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({
        success: true,
        data: updatedUser,
        message: message.USER?.UPDATE_PROFILE_SUCCESS || "Cập nhật thông tin người dùng thành công"
    });
});

const updatePassword = handleAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(createError(400, "Mật khẩu hiện tại và mật khẩu mới là bắt buộc"));
    }

    const user = await User.findById(userId);

    if (!user) {
        return next(createError(404, "Không tìm thấy người dùng"));
    }

    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
        return next(createError(400, "Mật khẩu hiện tại không đúng"));
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updated_at = new Date();
    
    await user.save();

    res.status(200).json({
        success: true,
        message: message.USER?.UPDATE_PASSWORD_SUCCESS || "Cập nhật mật khẩu thành công"
    });
});

const updateAvatar = handleAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { avatar } = req.body;

    if (!avatar) {
        return next(createError(400, "URL avatar là bắt buộc"));
    }

    const user = await User.findById(userId);

    if (!user) {
        return next(createError(404, "Không tìm thấy người dùng"));
    }

    user.avatar = avatar;
    user.updated_at = new Date();
    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({
        success: true,
        data: updatedUser,
        message: message.USER?.UPDATE_AVATAR_SUCCESS || "Cập nhật avatar thành công"
    });
});

export { getProfile, updateProfile, updatePassword, updateAvatar }; 