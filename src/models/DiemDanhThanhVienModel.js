const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment-timezone')

const DiemDanhThanhVien = new Schema({
    idSheet: { type: String, required: true },
    infoThanhVien: { type: Object, required: true },
    status: { type: Number, required: true }, // Trạng thái bao gồm: 0: Nghỉ, 1: Đã điểm danh
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
DiemDanhThanhVien.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    const now = moment.tz(Date.now(), 'Asia/Ho_Chi_Minh').format();
    this.set({ updatedAt: now }); // Cập nhật trường updatedAt với thời gian hiện tại ở múi giờ Việt Nam
    next();
});

module.exports = mongoose.model('diemDanhThanhVien', DiemDanhThanhVien)