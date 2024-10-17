const express = require('express');
const DiemDanhController = require('../controllers/DiemdanhController');
const auth = require('../middlewares/auth');
const router = express.Router()

router.post('/createSheetDiemDanh', auth.veryfy, DiemDanhController.createSheetDiemDanh);
router.post('/softSubmit', auth.veryfy, DiemDanhController.softSubmit);
router.post('/blockDiemDanh', auth.veryfy, DiemDanhController.blockDiemDanh);

router.get('/getListSheetDiemDanh', auth.veryfy, DiemDanhController.getListSheet);
router.get('/getListMemberDiemDanh/:idSheet', auth.veryfy, DiemDanhController.getListMemberDiemDanh);

module.exports = router;