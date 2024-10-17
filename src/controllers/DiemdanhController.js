const DiemDanhThanhVienModel = require("../models/DiemDanhThanhVienModel")
const SheetDiemDanhModel = require("../models/SheetDiemDanhModel")
const moment = require('moment-timezone')

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
            const newSheetDiemDanh = await new SheetDiemDanhModel({
                time: req.body.time
            }).save()
            res.json({
                status: true,
                message: "Thêm sheet thành công",
                data: newSheetDiemDanh
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
    softSubmit: async (req, res) => {
        const {body} = req
        try {
            const sheetDiemDanh = await SheetDiemDanhModel.findById(body.idSheet)
            if(!sheetDiemDanh || sheetDiemDanh.status == 2) {
                res.json({
                    status: false,
                    message: "Không thể lưu khi đã chốt danh sách điểm danh"
                })
                return
            } 
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
            await SheetDiemDanhModel.updateOne({_id: body.idSheet}, {status: 1})
            const now = moment.tz(Date.now(), 'Asia/Ho_Chi_Minh').format();
            res.json({
                status: true,
                message: "Thành công",
                data: {
                    updatedAt: now
                }
            })
            
        } catch (error) {
            console.log(error)
            res.json({
                status: false,
                message: "Có lỗi khi chốt điểm danh mềm"
            })
        }
    },
    getListMemberDiemDanh: async(req, res) => {
        const {params} = req
        try {
            const sheetDiemDanh = await SheetDiemDanhModel.findById(params.idSheet)
            if(sheetDiemDanh.status == 0 || !sheetDiemDanh) {
                res.json({
                    status: false,
                    message: "Không đúng trạng thái của sheet điểm danh"
                })
                return
            }
            const listMember = await DiemDanhThanhVienModel.find({idSheet: params.idSheet})
            res.json({
                status: true,
                message: "Lấy danh sách member thành công",
                data: listMember
            })
        } catch (error) {
            console.log(error)
            res.json({
                status: false,
                message: "Có lỗi khi lấy danh sách thành viên điểm danh"
            })
        }
    },
    blockDiemDanh: async (req, res) => {
        const {body} = req
        try {
            const sheetDiemDanh = await SheetDiemDanhModel.findById(body.idSheet)
            if(!sheetDiemDanh || sheetDiemDanh.status != 1) {
                res.json({
                    status: false,
                    message: 'Sheet điểm danh không tồn tại hoặc chưa lưu lại, bạn cần lưu sheet trước khi chốt điểm danh.'
                })
                return
            }
            const now = moment.tz(Date.now(), 'Asia/Ho_Chi_Minh').format();
            await sheetDiemDanh.updateOne({status: 2})
            res.json({
                status: true,
                message: "Chốt điểm danh thành công",
                data: {
                    updatedAt: now
                }
            })
        } catch (error) {
            console.log(error)
            res.json({
                status: false,
                message: "Có lỗi khi chốt điểm danh"
            })
        }
    }
}

module.exports = DiemDanhController