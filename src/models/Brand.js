import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên thương hiệu
    logoUrl: String, // Link logo
    description: String, // Mô tả thương hiệu
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  },
  {
    timestamps: true, // Tự động sinh createdAt & updatedAt
    versionKey: false
  }
);

const Brand = mongoose.model("Brand", brandSchema);
export default Brand;