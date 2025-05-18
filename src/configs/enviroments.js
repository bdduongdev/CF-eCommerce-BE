import dotenv from "dotenv";

dotenv.config();

export const {
	PORT = process.env.PORT || 8888,
	DB_URI = process.env.DB_URI,
	JWT_SECRET = process.env.JWT_SECRET,
	JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET,
	NODE_ENV = process.env.NODE_ENV,
	SUB_CATEGORY_DEFAULT,
	CATEGOGY_DEFAULT,
	EMAIL_USERNAME,
	EMAIL_PASSWORD,
	RESET_PASSWORD_SECRET,
	RESET_PASSWORD_EXPIRES,
	FRONTEND_URL,
} = process.env;
