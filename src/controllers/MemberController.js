const MemberModel = require("../models/MemberModel")

const MemberController = {
    createMember: async (req, res) => {
        const {body} = req
        try {
            const newMember = new MemberModel({
                fullname: body.fullname
            })
            await newMember.save()
            res.json({
                status: true,
                message: "Thêm member thành công"
            })
        } catch (error) {
            console.log(error)
            res.json({
                status: false,
                message: "Lỗi khi create member"
            })
        }
    },
    showListMember: async (req, res) => {
        try {
            const data = await MemberModel.find()
            res.json({
                status: true,
                message: "Lấy danh sách thành viên thành công",
                data: data
            })
        } catch (error) {
            console.log(error)
            res.json({
                status: false,
                message: "Có lỗi khi lấy danh sách member"
            })
        }
    }
}

module.exports = MemberController