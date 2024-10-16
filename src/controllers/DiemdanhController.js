const DiemDanhThanhVienModel = require("../models/DiemDanhThanhVienModel")
const SheetDiemDanhModel = require("../models/SheetDiemDanhModel")

const DiemDanhController = {
    createSheetDiemDanh: async (req, res) => {
        try {
            const result = await SheetDiemDanhModel.aggregate([
                {
                  $match: {
                    createdAt: {
                      $gte: new Date().toISOString(),
                      $lte: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()
                    }
                  }
                },
                {
                  $count: "total"
                }
            ])
            const count = result[0]?.total || 0
            const limit = 2
            if(count > limit - 1) {
                res.json({
                    status: false,
                    message: `Chỉ được thêm tối đa ${limit} sheet trong ngày`
                })
                return
            }
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
    },
    sortSubmit: async (req, res) => {
        const {body} = req
        try {
            const thanhVienTheoSheet = await DiemDanhThanhVienModel.find({idSheet: body.idSheet});
            const listThanhVien = body.listThanhVien
            const dataDiemDanh = listThanhVien.map((e) => {
                return {
                    idSheet: body.idSheet,
                    infoThanhVien: e,
                    status: e.status
                }
            })
            const listId = thanhVienTheoSheet.map(e => {
                return e.infoThanhVien.idMember
            })
            for (const item of dataDiemDanh) {
                const infoThanhVien = item.infoThanhVien
                const idMember = infoThanhVien.idMember

                if(listId.includes(idMember)){
                    const idSheetThanhVien = thanhVienTheoSheet.find((e) => e.infoThanhVien.idMember == idMember).id
                    await DiemDanhThanhVienModel.updateOne({_id: idSheetThanhVien}, {infoThanhVien: infoThanhVien, status: infoThanhVien.status});
                } else {
                    const newSheetThanhVien = new DiemDanhThanhVienModel(item);
                    await newSheetThanhVien.save();
                }
            }
            res.json({
                status: true,
                message: "Thành công"
            })
            
        } catch (error) {
            console.log(error)
            res.json({
                status: false,
                message: "Có lỗi khi chốt điểm danh mềm"
            })
        }
    }
}

module.exports = DiemDanhController