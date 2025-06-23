import mongoose from "mongoose";

const ProductStorageSchema = new mongoose.Schema({
    storage_name: {
        type: String,
        required: [true, "Tên dung lượng là bắt buộc"],
        trim: true,
        maxlength: [100, "Tên dung lượng không được vượt quá 100 ký tự"]
    },
    is_deleted: {
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
});

export default mongoose.model("ProductStorage", ProductStorageSchema);