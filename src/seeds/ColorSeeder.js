import ProductColor from "../models/ProductColor.js";

const seedColors = async () => {
  try {
    await ProductColor.deleteMany();
    console.log("Đã xóa dữ liệu Color cũ");

    const colors = [
      {
        color_name: "Đen",
        price: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        color_name: "Trắng",
        price: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        color_name: "Bạc",
        price: 500000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        color_name: "Vàng",
        price: 1000000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        color_name: "Xanh dương",
        price: 500000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        color_name: "Đỏ",
        price: 500000,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await ProductColor.insertMany(colors);
    console.log(`Đã thêm ${colors.length} màu sắc mẫu`);
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed Color: ${error.message}`);
    return false;
  }
};

export default seedColors;