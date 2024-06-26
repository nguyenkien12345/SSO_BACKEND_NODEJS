require('dotenv').config();
import db from '../models/index';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { getGroupWithRoles } from './JWTService';
import { createJWT } from '../middleware/JWTAction';
import { v4 as uuidv4 } from 'uuid';

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (userPassword) => {
    let hashPassword = bcrypt.hashSync(userPassword, salt);
    return hashPassword;
}

const checkEmailExist = async (userEmail) => {
    let user = await db.User.findOne({
        where: { email: userEmail }
    })

    if (user) {
        return true;
    }
    return false;
}

const checkPhoneExist = async (userPhone) => {
    let user = await db.User.findOne({
        where: { phone: userPhone }
    })

    if (user) {
        return true;
    }
    return false;
}

const registerNewUser = async (rawUserData) => {
    try {
        //check email/phonenumber are exist
        let isEmailExist = await checkEmailExist(rawUserData.email);
        if (isEmailExist === true) {
            return { EM: 'The email is already exist', EC: 1 }
        }
        let isPhoneExist = await checkPhoneExist(rawUserData.phone);
        if (isPhoneExist === true) {
            return { EM: 'The phone number is already exist', EC: 1 }
        }
        //hash user password
        let hashPassword = hashUserPassword(rawUserData.password);

        //create new user
        await db.User.create({
            email: rawUserData.email,
            username: rawUserData.username,
            password: hashPassword,
            phone: rawUserData.phone,
            groupId: 4
        })

        return { EM: 'A user is created successfully!', EC: '0' }

    } catch (e) {
        return { EM: 'Somthing wrongs in service...', EC: -2 }
    }
}

const checkPassword = (inputPassword, hashPassword) => {
    return bcrypt.compareSync(inputPassword, hashPassword); 
}

const handleUserLogin = async (rawData) => {
    try {
        let user = await db.User.findOne({
            where: {
                [Op.or]: [
                    { email: rawData.valueLogin },
                    { phone: rawData.valueLogin }
                ]
            }
        })

        if (user) {
            let isCorrectPassword = checkPassword(rawData.password, user.password);
            if (isCorrectPassword === true) {
                const code = uuidv4();
                let groupWithRoles = await getGroupWithRoles(user);
                return { 
                    EM: 'ok!', 
                    EC: 0, 
                    DT: {  // Các thông tin trong field DT này sẽ được lưu vào trong session của cookie
                        code: code,
                        email: user.email,
                        username: user.username,
                        groupWithRoles: groupWithRoles
                    } 
                }
            } else {
                return { 
                    EM: 'Your password is incorrect!', 
                    EC: 2, 
                    DT: '' 
                }
            }
        }
        return { 
            EM: 'Your email/phone number is incorrect!', 
            EC: 1, 
            DT: '' 
        }
    } catch (error) {
        return { 
            EM: 'Something wrongs in service...',
            EC: -2 
        }
    }
}

const updateUserRefreshToken = async (email, refreshToken) => {
    try {
       await db.User.update(
        { refreshToken: refreshToken },
        {
            where: { email: email }
        }
       )
    } catch (error) {
        return { 
            EM: 'Something wrongs in service...', 
            EC: -2 
        }
    }
}

// upsert: Có nghĩa là update và insert
const upsertAccountSocialMedia = async (typeLogin, data) => {
    try {
        let user = null;
        user = await db.User.findOne({
            where: {
                email: data.email,
                typeLogin: typeLogin
            },
            // Thay vì trả ra kiểu dữ liệu là sequelize (Có nhiều field không cần thiết) thì ta sẽ trả ra dữ liệu thuần kiểu object
            raw: true
        })
        if(!user) {
            user = await db.User.create({
                email: data.email,
                username: data.username,
                typeLogin: typeLogin
            });
            // .get({plain:true}) Thay vì trả ra kiểu dữ liệu là sequelize (Có nhiều field không cần thiết) thì ta sẽ trả ra dữ liệu thuần kiểu object
            user = user.get({plain:true});
        }

        return user;
    }
    catch (error) { 
        return { 
            EM: 'Something wrongs in service...', 
            EC: -2 
        }
    }
}

module.exports = {
    registerNewUser, 
    handleUserLogin, 
    hashUserPassword, 
    checkEmailExist, 
    checkPhoneExist,
    updateUserRefreshToken,
    upsertAccountSocialMedia
}