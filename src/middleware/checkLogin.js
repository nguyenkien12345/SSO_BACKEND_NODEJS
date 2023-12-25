const checkLogin = (req, res, next) => {
    // req.isAuthenticated() sẽ cho chúng ta biết là chúng ta đã đăng nhập hay chưa thông qua passport
    if(req.isAuthenticated()) {
        if(req.path === '/login') {
            return res.redirect("/");
        }
        next();
    }
    else {
        // Đoạn code dưới đây đã được tối ưu để fix vòng lặp vô hạn
        if(req.path === '/login') {
            next();
        }
        else {
            return res.redirect('/login');
        }
    }
}

module.exports = {
    checkLogin
}