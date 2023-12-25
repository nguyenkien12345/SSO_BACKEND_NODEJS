'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

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

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;
module.exports = db;
