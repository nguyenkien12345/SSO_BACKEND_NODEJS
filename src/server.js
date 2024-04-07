require("dotenv").config();
import express from "express";
import configViewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";
import initApiRoutes from "./routes/api";
import configCors from "./config/cors";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { configPassport } from './controller/passportController';
import { configPassportGoogle } from './controller/googleController';
import { configPassportFacebook } from './controller/facebookController';
import connectDB from './config/connectDB';
import configSession from './config/session';
// Hiển thị lỗi bên server với Flash Message
import flash from 'connect-flash';

const app = express();
const PORT = process.env.PORT || 8080;

// config flash message
app.use(flash());

//config cors
configCors(app);

// connect DB
connectDB();

//config view engine
configViewEngine(app);

//config body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//config cookie -parser
app.use(cookieParser());
// Luôn luôn để cấu hình session nằm dưới cấu hình sử dụng cookie
configSession(app);

//init web routes
initWebRoutes(app);
initApiRoutes(app);

// Chỉ gọi middleware khi chúng ta đã khởi tạo toàn bộ route của dự án

//req => middleware => res
app.use((req, res) => {
    return res.send('404 not found')
})

configPassport();
configPassportGoogle();
configPassportFacebook();

app.listen(PORT, () => {
    console.log(">>> JWT Backend is running on the port = " + PORT);
})