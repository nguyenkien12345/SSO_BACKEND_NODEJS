import session from "express-session";
import Sequelize from "sequelize";
import connectSessionSequelize from "connect-session-sequelize";
import passport from "passport";

const configSession = (app) => {
    // initialize sequelize with session store
    const sequelizeStore = connectSessionSequelize(session.Store);

    // Connect DB
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

    const myStore = new sequelizeStore({
        db: sequelize
    });

    app.use(
        session({
            secret: "NTKMTTT",
            store: myStore,
            // Session sẽ không được lưu lại mỗi khi có một yêu cầu mới mà không có sự thay đổi nào trong thông tin phiên. 
            resave: false,
            proxy: true,
            // Nếu một session mới được tạo trong một yêu cầu (ví dụ: người dùng mới truy cập trang web), nhưng không có sự thay đổi nào được thực hiện trong session, thì session đó sẽ không được lưu trữ trong cơ sở dữ liệu.
            // Nếu một session mới được tạo và có sự thay đổi, thì session đó sẽ được lưu trữ.
            saveUninitialized: false,
            // Thời gian sống của session
            expiration: 30 * 1000,
            // Thời gian sống của cookie
            cookie: { expires: 30 * 1000 }
        })
    );

    // Nó sẽ tạo ra 1 bảng sessions trong database của chúng ta để lưu trữ các phiên vào trong bảng này.
    myStore.sync();

    // Sử dụng passport để validate người dùng thông qua session
    app.use(passport.authenticate('session'));

    // serializeUser luôn luôn chạy trước deserializeUser
    // deserializeUser luôn luôn chạy sau serializeUser

    // + passport.serializeUser chỉ chạy khi chúng ta chưa tồn tại session id, còn nếu đã tồn tại session id
    // thì nó sẽ bỏ qua passport.serializeUser và chạy luôn thằng passport.deserializeUser

    // + Khi chúng ta bắt đầu thực hiện đăng nhập thì nó sẽ luôn luôn chạy tuần tự từ serializeUser rồi đến deserializeUser
    
    // + Khi chúng ta đã đăng nhập rồi và chỉ thực hiện reload/f5 trang web thì nó sẽ chỉ chạy vào mỗi deserializeUser để lấy ra 
    // thông tin người dùng từ database thông qua session id đang tồn tại

    passport.serializeUser(function (user, cb) {
        // Thực hiện lưu thông tin user vào bên trong session. Và thông tin session này sẽ được lưu vào 
        // trong bảng sessions trong database của chúng ta 
        process.nextTick(function(){
            cb(null, user);
        });
    })

    passport.deserializeUser(function(user, cb) {
        // Thực hiện lấy thông tin user từ bên dưới database lên.
        // Bản chất chúng ta sử dụng cb(null, user) chính là req.user.
        // Những thông tin chúng ta gán ở trong cb(null, user) cũng sẽ ăn vào bên trong req.user
        process.nextTick(function(){
            cb(null, user);
        });
    });
}

export default configSession;