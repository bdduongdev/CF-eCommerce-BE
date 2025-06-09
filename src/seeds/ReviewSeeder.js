import Review from "../models/Review.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { faker } from '@faker-js/faker';

const seedReviews = async (count = 50) => {
  try {
    await Review.deleteMany();
    console.log("Đã xóa dữ liệu Review cũ");

    // Lấy danh sách người dùng và sản phẩm từ database
    const users = await User.find({ role: "customer" });
    const products = await Product.find();

    // Kiểm tra xem có đủ dữ liệu để tạo đánh giá không
    if (users.length === 0 || products.length === 0) {
      console.log("Không đủ dữ liệu users hoặc products để tạo đánh giá");
      return false;
    }

    const reviews = [];
    const reviewsPerProduct = Math.min(Math.ceil(count / products.length), users.length);

    // Tạo đánh giá cho mỗi sản phẩm
    for (const product of products) {
      // Chọn ngẫu nhiên một số người dùng để đánh giá sản phẩm này
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffledUsers.slice(0, reviewsPerProduct);
      
      for (const user of selectedUsers) {
        // Tạo ngày đánh giá trong khoảng 1-30 ngày gần đây
        const reviewDate = faker.date.recent({ days: 30 });
        
        reviews.push({
          user_id: user._id,
          product_id: product._id,
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
          review_date: reviewDate
        });
      }
    }

    // Giới hạn số lượng đánh giá theo count
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