import ProductStorage from "../models/ProductStorage.js";

const seedStorages = async (count = 5) => {
  try {
    await ProductStorage.deleteMany();
    console.log("Đã xóa dữ liệu Storage cũ");

    const storages = [
      {
        storage_name: "64GB",
        price: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        storage_name: "128GB",
        price: 1000000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        storage_name: "256GB",
        price: 2000000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        storage_name: "512GB",
        price: 4000000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        storage_name: "1TB",
        price: 8000000,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await ProductStorage.insertMany(storages);
    console.log(`Đã thêm ${storages.length} dung lượng mẫu`);
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed Storage: ${error.message}`);
    return false;
  }
};

export default seedStorages;