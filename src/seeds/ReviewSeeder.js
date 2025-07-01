import Review from "../models/Review.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import { faker } from '@faker-js/faker';

const seedReviews = async (count = 50) => {
  try {
    await Review.deleteMany();
    console.log("Đã xóa dữ liệu Review cũ");

    const users = await User.find({ role: "customer" });
    const variants = await ProductVariant.find().populate('product_id');

    if (users.length === 0 || variants.length === 0) {
      console.log("Không đủ dữ liệu users hoặc variants để tạo đánh giá");
      return false;
    }

    const reviews = [];
    const reviewsPerVariant = Math.min(Math.ceil(count / variants.length), users.length);

    for (const variant of variants) {
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffledUsers.slice(0, reviewsPerVariant);
      for (const user of selectedUsers) {
        const reviewDate = faker.date.recent({ days: 30 });
        reviews.push({
          user_id: user._id,
          product_id: variant.product_id?._id, // optional, for reference
          variant_id: variant._id,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.helpers.arrayElement([
            faker.lorem.paragraph(),
            "Sản phẩm rất tốt, đúng như mô tả.",
            "Chất lượng sản phẩm tuyệt vời, giao hàng nhanh.",
            "Tôi rất hài lòng với sản phẩm này.",
            "Sản phẩm đẹp, chất lượng ổn.",
            "Giao hàng nhanh, đóng gói cẩn thận.",
            "Giá cả hợp lý, chất lượng tốt.",
            "Sản phẩm đúng như hình, rất hài lòng.",
            "Tôi sẽ mua lại sản phẩm này.",
            "Sản phẩm tạm ổn, nhưng giá hơi cao.",
            "Chất lượng không như mong đợi."
          ]),
          created_at: reviewDate,
          updated_at: reviewDate
        });
      }
    }

    const limitedReviews = reviews.slice(0, count);
    await Review.insertMany(limitedReviews);
    console.log(`Đã thêm ${limitedReviews.length} đánh giá mẫu`);
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed Review: ${error.message}`);
    return false;
  }
};

export default seedReviews; 