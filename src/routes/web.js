import express from "express";
import homeController from '../controller/homeController';
import apiController from '../controller/apiController';
import authController from '../controller/authController';
import passportController from '../controller/passportController';
import passport from "passport";
// Middleware
import { checkLogin } from '../middleware/checkLogin';

const router = express.Router();

/**
 * 
 * @param {*} app : express app
 */

const initWebRoutes = (app) => {
    router.get("/", checkLogin, homeController.handleHelloWord);
    router.get("/user", checkLogin, homeController.handleUserPage);
    router.post("/users/create-user", checkLogin, homeController.handleCreateNewUser);
    router.post("/delete-user/:id", checkLogin, homeController.handleDelteUser)
    router.get("/update-user/:id", checkLogin, homeController.getUpdateUserPage);
    router.post("/user/update-user", checkLogin, homeController.handleUpdateUser);

    router.get("/api/test-api", apiController.testApi);

    router.get("/login", checkLogin, authController.showLoginPage);
    router.post('/verify-sso-token', authController.verifySSOToken);

    // Xác thực người dùng thành công/thất bại thông qua middleware passport
    // Cách 1: Sử dụng Flash Message
    // router.post('/login', passport.authenticate('local', {
    //     // Xác thực người dùng thành công
    //     successRedirect: '/',
    //     // Xác thực người dùng thất bại
    //     failureRedirect: '/login'
    // }));

    // Cách 2: Sử dụng Ajax
    router.post('/login', function (req, res, next) {
        passport.authenticate('local', function(error, user, info) {
            // Trường hợp thất bại
            if(error) {
                return res.status(500).json(error);
            }
            if(!user) {
                // Khi mà bên passport bắt lỗi xác thực người dùng thất bại thì nó sẽ trả ra lỗi mà ta đang 
                // cấu hình lỗi trả về là 1 object gồm 2 field message và code như sau: 
                // { code: response?.EC, message: response?.EM } => Nó chính là field info (ts thứ 3 của hàm)
                return res.status(401).json(info);
            }

            // Trường hợp thành công
            // req.login là 1 hàm đặc biệt của passport. Nhờ có req.login mà nó sẽ lưu cái thông tin user vào bên trong
            // session cho chúng ta. Khi chúng ta đăng nhập thành công thì thằng passport nó sẽ gán thông tin của người dùng vào req.user. Chúng 
            // ta có thể lấy thông tin của người dùng mà passport trả ra thông qua req.user
            // Chúng ta cũng có thể lấy ra toàn bộ thông tin người dùng gửi từ form lên thông qua req.body
            req.login(user, function(error) {
                if(error) return next(error);
                // Chúng ta sẽ trả lại toàn bộ thông tin người dùng kèm thêm redirectUrl để thực hiện chuyển trang luôn
                return res.status(200).json({
                    ...user, redirectUrl: req.body.redirectUrl
                });
            });
        })(req, res, next);
    });

    router.post('/logout', passportController.handleLogout)

    return app.use("/", router);
}

export default initWebRoutes;