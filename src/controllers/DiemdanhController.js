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
    }
}

module.exports = DiemDanhController