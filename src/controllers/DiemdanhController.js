const DiemDanhThanhVienModel = require("../models/DiemDanhThanhVienModel")
const SheetDiemDanhModel = require("../models/SheetDiemDanhModel")
const moment = require('moment-timezone')
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');

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
    },
    generateExcelFile: async (req, res) => {
        const data = await DiemDanhThanhVienModel.find({ idSheet: req.params.idSheet });
        const ws = XLSX.utils.json_to_sheet(data.map((item, index) => ({
            "Số thứ tự": index + 1, // Bắt đầu từ 1 thay vì 0
            "Họ và tên": item.infoThanhVien.fullname,
            "Trạng thái điểm danh": item.infoThanhVien.status == 0 ? "Nghỉ" : "Đã điểm danh",
        })));

        // Đặt định dạng cho tiêu đề cột
        const headers = ["Số thứ tự", "Họ và tên", "Trạng thái điểm danh"];
        const headerRow = headers.reduce((acc, header, index) => {
            acc[`A${index + 1}`] = { v: header }; // Gán tiêu đề cho ô
            return acc;
        }, {});

        // Thêm tiêu đề vào worksheet
        XLSX.utils.sheet_add_json(ws, [headerRow], { skipHeader: true, origin: "A1" });

        // Đặt định dạng cho tiêu đề cột
        for (let i = 0; i < headers.length; i++) {
        const cell = ws[`A${i + 1}`];
        if (cell) {
            cell.s = {
            font: {
                bold: true, // In đậm tiêu đề
                name: "Times New Roman", // Thay đổi font chữ
                sz: 12, // Kích thước font
                color: { rgb: "FF000000" }, // Màu sắc font (đen)
            },
            alignment: {
                horizontal: "center", // Căn giữa tiêu đề
            },
            };
        }
        }

        // Tự động điều chỉnh chiều rộng của các cột
        const colWidths = {
            "Số thứ tự": 0,
            "Họ và tên": 0,
            "Trạng thái điểm danh": 0,
        };

        // Tính toán chiều rộng cho mỗi cột
        data.forEach((item, index) => {
            const fullnameLength = item.infoThanhVien.fullname.length;
            const statusLength = item.infoThanhVien.status == 0 ? "Nghỉ".length : "Đã điểm danh".length;

            colWidths["Số thứ tự"] = Math.max(colWidths["Số thứ tự"], (index + 1).toString().length); // Đổi từ index sang số thứ tự
            colWidths["Họ và tên"] = Math.max(colWidths["Họ và tên"], fullnameLength);
            colWidths["Trạng thái điểm danh"] = Math.max(colWidths["Trạng thái điểm danh"], statusLength);
        });

        // Thiết lập chiều rộng cho các cột
        ws['!cols'] = Object.keys(colWidths).map(key => ({ wch: colWidths[key] + 10 }));

        // Tạo workbook mới và thêm worksheet vào đó
        const wb = XLSX.utils.book_new();

        // Đặt tên cho worksheet và thêm vào workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Members');

        // Xuất file Excel dưới dạng buffer
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

        // Chuyển đổi buffer thành base64
        const base64Excel = Buffer.from(excelBuffer).toString('base64');

        // Gửi dữ liệu về client
        res.send(base64Excel);
    },
    getListDiemDanhMember: async (req, res) => {
        try {
            const listSheet = await SheetDiemDanhModel.find({status: 2})
            const numberOfFirstTime = listSheet.filter((e) => e.time == 1).length
            const numberOfSecondTime = listSheet.filter((e) => e.time == 2).length
            const numberOfThirdTime = listSheet.filter((e) => e.time == 3).length
            const listSheetMember = await DiemDanhThanhVienModel.find().populate('idSheet');
            const listSheetMemberReal = listSheetMember.filter((e) => (e.idSheet.status == 2 && e.status == 1))
            const data = listSheetMemberReal;

            // Gộp theo idMember
            const groupedData = Object.values(
                data.reduce((acc, item) => {
                    const id = item.infoThanhVien.idMember;

                    if (!acc[id]) {
                    acc[id] = {
                        idMember: id,
                        fullname: item.infoThanhVien.fullname, // Lấy fullname bất kỳ
                        times: {}
                    };
                    }

                    // Chuyển đổi time thành chuỗi tương ứng
                    const timeMapping = {
                    "1": "Sáng",
                    "2": "Chiều",
                    "3": "Lễ"
                    };
                    const time = timeMapping[item.idSheet.time] || item.idSheet.time; // Đề phòng nếu có time khác

                    if (!acc[id].times[time]) {
                    acc[id].times[time] = 0;
                    }
                    acc[id].times[time] += 1;

                    return acc;
                }, {})
            );
            res.json({
                status: true,
                data: {
                    soLuongBuoiHoc: {
                        tongBuoiSang: numberOfFirstTime,
                        tongBuoiChieu: numberOfSecondTime,
                        le: numberOfThirdTime
                    },
                    chiTietTungMember: groupedData
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = DiemDanhController