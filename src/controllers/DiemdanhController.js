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
const wb = XLSX.utils.book_new();

// Tạo tiêu đề cho worksheet
const header = [
  { ID: "ID" },
  { SheetID: "SheetID" },
  { MemberID: "MemberID" },
  { Fullname: "Fullname" },
  { Status: "Status" },
  { CreatedAt: "CreatedAt" },
  { UpdatedAt: "UpdatedAt" },
];

// Chuyển tiêu đề thành một đối tượng
const headerObject = header.reduce((acc, curr) => ({ ...acc, ...curr }), {});

// Thêm tiêu đề vào worksheet
const ws = XLSX.utils.json_to_sheet(data.map(item => ({
  ID: item._id.toString(),
  SheetID: item.idSheet,
  MemberID: item.infoThanhVien.idMember,
  Fullname: item.infoThanhVien.fullname,
  Status: item.infoThanhVien.status,
  CreatedAt: item.createdAt,
  UpdatedAt: item.updatedAt,
})));

// Thêm hàng tiêu đề vào worksheet
XLSX.utils.sheet_add_json(ws, [headerObject], { skipHeader: true, origin: "A1" });

// Đặt định dạng cho tiêu đề hàng
const range = XLSX.utils.decode_range(ws['!ref']);
for (let col = range.s.c; col <= range.e.c; col++) {
  const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
  const cell = ws[cellAddress];
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

// Đặt tên cho worksheet và thêm vào workbook
XLSX.utils.book_append_sheet(wb, ws, 'Members');

// Xuất file Excel dưới dạng buffer
const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

// Chuyển đổi buffer thành base64
const base64Excel = Buffer.from(excelBuffer).toString('base64');

// Gửi dữ liệu về client
res.send(base64Excel);
    }
}

module.exports = DiemDanhController