import User from "../models/User.js";
import bcrypt from "bcrypt";
import { faker } from '@faker-js/faker';

const seedUsers = async (count = 10) => {
  try {
    await User.deleteMany();
    console.log("Đã xóa dữ liệu User cũ");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const users = [];

    users.push({
      fullname: "Admin User",
      email: "admin@gmail.com",
      password: hashedPassword,
      phone: faker.phone.number('0#########'),
      avatar: `/images/avatars/admin-avatar.png`,
      dateOfBirth: faker.date.birthdate({ min: 25, max: 50, mode: 'age' }),
      gender: "male",
      address: `${faker.location.street()}, ${faker.location.city()}, Việt Nam`,
      detailedAddress: {
        street: faker.location.street(),
        ward: faker.location.street(),
        district: faker.location.county(),
        city: faker.location.city(),
        country: "Việt Nam"
      },
      role: "admin",
      created_at: new Date(),
      updated_at: new Date()
    });

    for (let i = 0; i < count - 1; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const now = new Date();
      const gender = faker.person.sex();
      const city = faker.location.city();
      const street = faker.location.street();
      const county = faker.location.county();

      users.push({
        fullname: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }),
        password: hashedPassword,
        phone: faker.phone.number('0#########'),
        avatar: `/images/avatars/user-${i + 1}.png`,
        dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        gender: gender === 'male' ? 'male' : 'female',
        address: `${street}, ${city}, Việt Nam`,
        detailedAddress: {
          street: street,
          ward: faker.location.street(),
          district: county,
          city: city,
          country: "Việt Nam"
        },
        role: "customer",
        created_at: now,
        updated_at: now
      });
    }

    await User.insertMany(users);
    console.log(`Đã thêm ${users.length} người dùng (1 admin và ${users.length - 1} customer)`);
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed User: ${error.message}`);
    return false;
  }
};

export default seedUsers;