require('dotenv').config();
import loginRegisterService from '../service/loginRegisterService';

// EM: error message
// EC: error code
// DT: data 

const testApi = (req, res) => {
    return res.status(200).json({
        message: 'ok',
        data: 'test api'
    })
}

const handleRegister = async (req, res) => {
    try {
        if (!req.body.email || !req.body.phone || !req.body.password) {
            return res.status(200).json({
                EM: 'Missing required parameters',
                EC: '1', 
                DT: '', 
            })
        }
        if (req.body.password && req.body.password.length < 4) {
            return res.status(200).json({
                EM: 'Your password must have more than 3 letters',
                EC: '1', 
                DT: '', 
            })
        }

        //service: create user
        let data = await loginRegisterService.registerNewUser(req.body)

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC, 
            DT: '', 
        })

    } catch (e) {
        return res.status(500).json({
            EM: 'error from server',
            EC: '-1', 
            DT: '', 
        })
    }
}

const handleLogin = async (req, res) => {
    try {

        let data = await loginRegisterService.handleUserLogin(req.body);
        //set cookie
        if (data && data.DT && data.DT.access_token) {
            res.cookie("jwt", data.DT.access_token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        }

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC, 
            DT: data.DT, 
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            EM: 'error from server',
            EC: '-1', 
            DT: '', 
        })
    }
}

const handleLogout = (req, res) => {
    try {
        const optionsClearCookie = {
            // domain của cookie mà chúng ta muốn xóa. VD domain của chúng ta là example.com thì cookie chỉ sẽ được xóa nếu nó được gửi từ domain là example.com
            // Nếu giá trị của domain là null hoặc undefined, cookie sẽ được xóa từ tất cả các domain.
            domain: process.env.COOKIE_DOMAIN, 
            // path của đường dẫn trên server mà cookie sẽ được xóa. VD path là /admin, thì cookie chỉ sẽ được xóa nếu nó được gửi từ đường dẫn là /admin hoặc các con đường của nó 
            // (ví dụ: /admin/dashboard).
            path: process.env.COOKIE_PATH
        }
        // cookie nào sẽ được xóa dựa trên domain và path của chúng.
        res.clearCookie("access_token", optionsClearCookie);
        res.clearCookie("refresh_token", optionsClearCookie);
        return res.status(200).json({
            EM: 'clear cookies done!',
            EC: 0, 
            DT: '', 
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            EM: 'error from server',
            EC: '-1', 
            DT: '', 
        })
    }
}

module.exports = {
    testApi, handleRegister, handleLogin, handleLogout
}