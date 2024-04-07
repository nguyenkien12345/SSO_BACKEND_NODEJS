import 'dotenv/config'
import passport from 'passport';
import GoogleStratagy from 'passport-google-oauth20' ;
import loginRegisterService from '../service/loginRegisterService';
import { v4 as uuidv4 } from 'uuid'

const configPassportGoogle = () => {
    // Mô hình hoạt động: route => passport (middleware) => controller => view
    passport.use(new GoogleStratagy.Strategy(
    {
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_AUTH_REDIRECT_URL,
    },
    async function (access_token, refresh_token, profile, cb) {
        const data = {
            username: profile.displayName,
            email: profile.emails &&  profile.emails.length > 0 ? profile.emails[0].value : profile.id,
            googleId: profile.id,
            avartar: profile.photos && profile.photos.length > 0 ? profile.photos[0] : "",
        }

        const user = await loginRegisterService.upsertAccountSocialMedia('GOOGLE', data);
        user.code = uuidv4();
        // Gọi vào đường dẫn /google/redirect và do st. (Nó sẽ gán biến user của chúng ta vào req.user. Để xem thông tin của user chúng ta chỉ việc gọi req.user)
        return cb(null, user);
    }
    ));
}

export {
    configPassportGoogle
};
