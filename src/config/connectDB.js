const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USERNAME, 
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      // Kiểm soát việc ghi log của Sequelize khi thực hiện các truy vấn đến cơ sở dữ liệu.
      logging: false, 
      // Sequelize sẽ giữ nguyên tên của mô hình (model) khi tạo bảng trong cơ sở dữ liệu. Nếu không 
      // có tùy chọn này hoặc nó được đặt là false (mặc định), Sequelize có thể thêm 's' 
      // vào cuối tên mô hình để tạo tên bảng (ví dụ: nếu mô hình có tên là User, bảng có thể có tên là
      //  Users)
      define: {
        freezeTableName: true
      },
      // Setup múi giờ (timezone)
      timezone: '+07:00',
    }
  );

const connection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export default connection;

