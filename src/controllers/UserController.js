import User from '../models/User.js';
import handleAsync from '../utils/handleAsync.js';
import createError from '../utils/createError.js';
import bcrypt from 'bcrypt';
import message from '../constants/index.js';

const getAllUsers = handleAsync(async (req, res, next) => {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = {};
    
    if (role) {
        query.role = role;
    }
    
    if (search) {
        query.$or = [
            { fullname: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { created_at: -1 }
    };
    
    const users = await User.find(query)
        .select('-password')
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .sort(options.sort);
    
    const totalUsers = await User.countDocuments(query);
    
    res.status(200).json({
        success: true,
        message: message.USER.GET_ALL_SUCCESS,
        data: {
            users,
            pagination: {
                total: totalUsers,
                page: options.page,
                limit: options.limit,
                pages: Math.ceil(totalUsers / options.limit)
            }
        }
    });
});

const getUserById = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
        return next(createError(404, message.USER.NOT_FOUND));
    }
    
    res.status(200).json({
        success: true,
        message: message.USER.GET_BY_ID_SUCCESS,
        data: user
    });
});

const updateUser = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['admin', 'customer'].includes(role)) {
        return next(createError(400, message.USER.INVALID_ROLE));
    }
    
    const user = await User.findByIdAndUpdate(
        id,
        { role, updated_at: Date.now() },
        { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
        return next(createError(404, message.USER.NOT_FOUND));
    }
    
    res.status(200).json({
        success: true,
        message: message.USER.CHANGE_ROLE_SUCCESS,
        data: user
    });
});

export { getAllUsers, getUserById, updateUser };
