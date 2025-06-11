import Banner from "../models/Banner.js";
import { faker } from "@faker-js/faker";

const seedBanners = async (count = 5) => {
  try {
    await Banner.deleteMany();
    console.log("Đã xóa dữ liệu Banner cũ");

    const positions = [
      "home_top",
      "home_middle",
      "home_bottom",
      "category_page",
      "product_page",
    ];
    const banners = [];

    for (let i = 0; i < count; i++) {
      const now = new Date();
      const startDate = faker.date.recent();
      const endDate = faker.date.future({ refDate: startDate });

      banners.push({
        title:
          faker.commerce.productAdjective() +
          " " +
          faker.commerce.productName(),
        image_url: faker.image.url({ width: 1200, height: 400 }),
        link_url: faker.internet.url(),
        position: positions[Math.floor(Math.random() * positions.length)],
        is_active: true,
        start_date: startDate,
        end_date: endDate,
        created_at: now,
        updated_at: now,
      });
    }

    await Banner.insertMany(banners);
    console.log(`Đã thêm ${banners.length} banner mẫu`);

    return true;
  } catch (error) {
    console.error(`Lỗi khi seed Banner: ${error.message}`);
    return false;
  }
};

export default seedBanners;
