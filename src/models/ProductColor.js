import mongoose from "mongoose";

const ProductColorSchema = new mongoose.Schema({
    color_name: {
        type: String,
        required: [true, "Tên màu sắc là bắt buộc"],
        trim: true,
        maxlength: [100, "Tên màu sắc không được vượt quá 100 ký tự"]
    },
    price: {
        type: Number,
        required: [true, "Giá là bắt buộc"],
        min: [0, "Giá không được âm"]
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

export default mongoose.model("ProductColor", ProductColorSchema);