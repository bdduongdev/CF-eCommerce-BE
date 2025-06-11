import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: "/images/avatars/default-avatar.png"
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "other"
    },
    address: {
        type: String,
        trim: true
    },
    detailedAddress: {
        street: {
            type: String,
            trim: true
        },
        ward: {
            type: String,
            trim: true
        },
        district: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            default: "Việt Nam",
            trim: true
        }
    },
    role: {
        type: String,
        enum: ["admin", "customer"],
        default: "customer"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Middleware để hash mật khẩu trước khi lưu
UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model("User", UserSchema);