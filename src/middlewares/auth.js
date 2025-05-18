import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/enviroments.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";

export const verifyToken = handleAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(createError(401, "Không có token xác thực"));
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return next(createError(401, "Token không hợp lệ hoặc đã hết hạn"));
    }
});

export const isAdmin = handleAsync(async (req, res, next) => {
    if (req.user.role !== "admin") {
        return next(createError(403, "Bạn không có quyền truy cập, chỉ Admin mới có quyền này"));
    }
    next();
});

export const isCustomer = handleAsync(async (req, res, next) => {
    if (req.user.role !== "customer") {
        return next(createError(403, "Bạn không có quyền truy cập, chỉ Customer mới có quyền này"));
    }
    next();
});

export const isAdminOrCustomer = handleAsync(async (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "customer") {
        return next(createError(403, "Bạn không có quyền truy cập"));
    }
    next();
});