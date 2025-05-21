import dotenv from "dotenv";

dotenv.config();

export const {
	PORT = process.env.PORT || 8888,
	DB_URI = process.env.DB_URI,
	JWT_SECRET = process.env.JWT_SECRET || "jwt_secret_default",
	JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "jwt_refresh_secret_default",
	NODE_ENV = process.env.NODE_ENV,
	SUB_CATEGORY_DEFAULT,
	CATEGOGY_DEFAULT,
	EMAIL_USERNAME,
	EMAIL_PASSWORD,
	RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET || "reset_password_secret_default",
	RESET_PASSWORD_EXPIRES = process.env.RESET_PASSWORD_EXPIRES || "3600000",
	FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173",
} = process.env;
