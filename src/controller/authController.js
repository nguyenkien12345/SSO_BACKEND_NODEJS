import { v4 as uuidv4 } from 'uuid';
import { createJWT } from '../middleware/JWTAction';
import { updateUserRefreshToken } from '../service/loginRegisterService';
import 'dotenv/config'

const showLoginPage = (req, res, next) => {
    // Cách 1: Sử dụng Flash Message
    // req.flash('data'): Chúng ta lấy ra lỗi thông qua key data được lưu trong flash message trong passportController
    // const arrErrors = req.flash('data');
    // const username = arrErrors[0] ? arrErrors[0] : '';
    // const errorCode = arrErrors[1] ? arrErrors[1] : '';
    // const errorMessage = arrErrors[2] ? arrErrors[2] : '';
    // return res.render('login.ejs', { 
    //     username: username, 
    //     errorCode: errorCode, 
    //     errorMessage: errorMessage
    // }

    // Cách 2: Sử dụng Ajax
    // Lấy về thông tin redirectUrl mà bên front-end truyền lên trên url
    try {
        const redirectUrl = req.query.redirectUrl;
        return res.render('login.ejs', { redirectUrl: redirectUrl });
    }
    catch (error) {
        return res.status(500).json({ 
            EM: 'Something wrongs in server...', 
            EC: -1,
            DT: ''
        });
    }
}

const verifySSOToken = async (req, res, next) => {
    try {
        // req.user chính là thông tin người dùng mà chúng ta lấy ra được thông qua cookie truyền lên từ client,
        // nó sẽ lấy cái session id trong cookie mà người dùng truyền lên mang vào trong database để tìm kiếm.
        // Nếu tìm thấy thì nó sẽ trả ra các thông tin của session đó (Lấy từ trong database ra và gán vào biến req.user)

        let payload = {
            email: req.user?.email ?? null,
            username: req.user?.username ?? null,
            groupWithRoles: req.user?.groupWithRoles ?? null,
        }
    
        let token = createJWT(payload);
        const refreshToken = uuidv4();

        // httpOnly: true => cookie sẽ chỉ được truy cập thông qua HTTP hoặc HTTPS và không thể được truy cập 
        // thông qua các kịch bản JavaScript. Cookie sẽ không thể bị đọc hoặc sửa đổi bởi mã JavaScript chạy trên trình duyệt

        // Set cookies (2 con cookies access_token và refresh_token thuộc về phía backend)
        // Mỗi khi có 1 website nào đó gọi lên con backend này thì ngay lập tức trình duyệt sẽ lấy các cookies của con backend này
        // gán vào browser của client
        res.cookie('access_token', token, {
            httpOnly: true,
            maxAge: Number(process.env.MAX_AGE_COOKIE_ACCESS_TOKEN),
            domain: process.env.COOKIE_DOMAIN, 
            path: process.env.COOKIE_PATH
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: Number(process.env.MAX_AGE_COOKIE_REFRESH_TOKEN),
            domain: process.env.COOKIE_DOMAIN, 
            path: process.env.COOKIE_PATH
        })

        // Update refreshToken To DB
        await updateUserRefreshToken(req.user?.email, refreshToken);

        const result = {
            access_token: token,
            refresh_token: refreshToken,
            ...payload
        };

        // Destroy session
        req.session.destroy(function (error) {
            if(!error) {
                req.logout();
            }
        });

        // Chúng ta phải đảm bảo ssoToken mà người dùng truyền lên bằng với code lấy ra từ database được gán vào trong req.user
        if(req.user && req.user?.code && req.user?.code === req.body.ssoToken) {
            return res.status(200).json({ 
                EM: 'ok', 
                EC: 0, 
                DT: result
            })
        }
        else {
            return res.status(401).json({ 
                EM: 'not match ssoToken', 
                EC: 3, 
                DT: null
            })
        }
    }
    catch (error) {
        console.log('error: ', error);
        return res.status(500).json({ 
            EM: 'Something wrongs in server...', 
            EC: -1,
            DT: ''
        });
    }
    
}

module.exports = {
    showLoginPage,
    verifySSOToken
};