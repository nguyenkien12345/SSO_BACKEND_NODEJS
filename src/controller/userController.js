import userApiService from '../service/userApiService';

// EM: error message
// EC: error code
// DT: data

const readFunc = async (req, res) => {
    try {
        if (req.query.page && req.query.limit) {
            let page = req.query.page;
            let limit = req.query.limit;
            let data = await userApiService.getUserWithPagination(+page, +limit);
            return res.status(200).json({
                EM: data.EM, 
                EC: data.EC, 
                DT: data.DT, 
            })
        } else {
            let data = await userApiService.getAllUser();
            return res.status(200).json({
                EM: data.EM, 
                EC: data.EC, 
                DT: data.DT, 
            })
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'error from server', 
            EC: '-1', 
            DT: '', 
        })
    }
}
const createFunc = async (req, res) => {
    try {
        //validate
        let data = await userApiService.createNewUser(req.body);
        return res.status(200).json({
            EM: data.EM, 
            EC: data.EC, 
            DT: data.DT, 
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: 'error from server', 
            EC: '-1', 
            DT: '', 
        })
    }
}
const updateFunc = async (req, res) => {
    try {
        //validate
        let data = await userApiService.updateUser(req.body);
        return res.status(200).json({
            EM: data.EM, 
            EC: data.EC, 
            DT: data.DT, 
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: 'error from server', 
            EC: '-1', 
            DT: '', 
        })
    }
}
const deleteFunc = async (req, res) => {
    try {
        let data = await userApiService.deleteUser(req.body.id);
        return res.status(200).json({
            EM: data.EM, 
            EC: data.EC, 
            DT: data.DT, 
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: 'error from server', 
            EC: '-1', 
            DT: '', 
        })
    }
}

const getUserAccount = async (req, res) => {
    return res.status(200).json({
        EM: 'ok', 
        EC: 0, 
        DT: {
            access_token: req.user.access_token,
            refresh_token: req.user.refresh_token,
            groupWithRoles: req.user.groupWithRoles,
            email: req.user.email,
            username: req.user.username
        }
    })
}
module.exports = {
    readFunc, createFunc, updateFunc, deleteFunc, getUserAccount
}