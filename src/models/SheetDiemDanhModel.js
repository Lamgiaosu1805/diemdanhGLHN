const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment-timezone')

const SheetDiemDanh = new Schema({
    status: { type: Number, default: 0 }, // Trạng thái chốt điểm danh: 1: Chốt mềm, 2: Chốt cứng, 0: Chưa chốt
    time: {type: Number, required: true}, // Buổi sáng hoặc chiều: 1: Sáng, 2: Chiều 
    createdAt: {
        type: String,
        default: () => moment.tz(Date.now(), 'Asia/Ho_Chi_Minh').format(), // Tự động lưu với múi giờ +7
    },
    updatedAt: {
      type: String,
      default: () => moment.tz(Date.now(), 'Asia/Ho_Chi_Minh').format(), // Tự động lưu với múi giờ +7
    },
},{
    timestamps: true
})
SheetDiemDanh.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    const now = moment.tz(Date.now(), 'Asia/Ho_Chi_Minh').format();
    this.set({ updatedAt: now }); // Cập nhật trường updatedAt với thời gian hiện tại ở múi giờ Việt Nam
    next();
});

module.exports = mongoose.model('sheetDiemDanh', SheetDiemDanh)