const SheetDiemDanhModel = require("../models/SheetDiemDanhModel")

const DiemDanhController = {
    createSheetDiemDanh: async (req, res) => {
        try {
            await new SheetDiemDanhModel({
                time: req.body.time
            }).save()
            res.json({
                status: true,
                message: "Thêm sheet thành công"
            })
        } catch (error) {
            console.log(error)
            res.json({
                status: false,
                message: "Có lỗi khi thêm sheet điểm danh"
            })
        }
    },
    getListSheet: async (req, res) => {
        try {
            const data = await SheetDiemDanhModel.find().sort({ createdAt: -1 })
            res.json({
                status: true,
                message: "Get list sheet thành công",
                data: data
            })
        } catch (error) {
            console.log(error)
            res.json({
                status: false,
                message: "Có lỗi khi get list sheet"
            })
        }
    }
}

module.exports = DiemDanhController