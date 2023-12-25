import passport from "passport";
import LocalStrategy from "passport-local";
import loginRegisterService from "../service/loginRegisterService"

const configPassport = () => {
    // Mô hình hoạt động: route => passport (middleware) => controller => view
    passport.use(new LocalStrategy({
        // Để sử dụng được req bên trong cái hàm xử lý của passport 
        // thì ta sẽ sử dụng option passReqToCallback: true
        passReqToCallback: true
    },
        async (req, username, password, cb) => {
            // Lưu ý: cb: Dù thành công hay thất bại thì nó cũng luôn luôn đi qua file session.js
            const rawData = { valueLogin: username, password: password };
            let response = await loginRegisterService.handleUserLogin(rawData);
            // EC có nghĩa là error code (0: là không có lỗi, Khác 0: là có lỗi)
            // EM có nghĩa là error message
            // DT có nghĩa là data
            if(Number(response?.EC) === 0) {
                // Thành công
                // Hàm callback này sẽ chạy vào trong hàm serializeUser của passport được khai báo trong file session.js
                // response?.DT chính là đầu vào của hàm serializeUser của passport. Chúng ta muốn session lưu trữ cái gì thì 
                // chúng ta sẽ truyền vào cái đó. Ở đây chúng ta muốn thằng session lưu toàn bộ thông tin của response?.DT thì bên thằng 
                // serializeUser sẽ nhận về biến response?.DT này
                return cb(null, response?.DT);
            }
            else {
                // Thất bại
                // Để controller có thể nhận được biến message và trả ra cho view hiển thị lên thì ta sẽ gán nó vào bên trong req (request)
                // Vì trước khi đi vào controller nó luôn luôn chạy qua middleware (passport)
                // req.flash('message', response?.EM): message là key, response?.EM là value
                // Chúng ta cũng có thể lưu vào flash 1 mảng các string

                // Cách 1: Sử dụng Flash Message
                // return cb(null, false, req.flash('data', [username, response?.EC, response?.EM]));

                // Cách 2: Sử dụng Ajax
                return cb(null, false, { code: response?.EC, message: response?.EM })
            }
        }
    ))
};

const handleLogout = (req, res, next) => {
    req.session.destroy(function (error) {
        req.logout();
        res.redirect('/login');
    });
};

module.exports = {
    configPassport,
    handleLogout
}