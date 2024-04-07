import 'dotenv/config'
import passport from 'passport';
import FacebookStratagy from 'passport-facebook';
import loginRegisterService from '../service/loginRegisterService';

const configPassportFacebook = () => {
    // Mô hình hoạt động: route => passport (middleware) => controller => view
    passport.use(new FacebookStratagy.Strategy(
    {
        clientID: process.env.FACEBOOK_AUTH_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_AUTH_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_AUTH_REDIRECT_URL,
        // Chúng ta muốn lấy ra thông tin của các trường này
        profileFields: ['id', 'emails', 'name', 'displayName']
    },
    async function (access_token, refresh_token, profile, cb) {
        const data = {
            username: profile.displayName,
            email: profile.emails &&  profile.emails.length > 0 ? profile.emails[0].value : profile.id,
            facebookId: profile.id,
        }

        const user = await loginRegisterService.upsertAccountSocialMedia('FACEBOOK', data);
        // Gọi vào đường dẫn /google/redirect và do st. (Nó sẽ gán biến user của chúng ta vào req.user. Để xem thông tin của user chúng ta chỉ việc gọi req.user)
        return cb(null, user);
    }
    ));
}

export {
    configPassportFacebook
};
