const express = require('express');
const DiemDanhController = require('../controllers/DiemdanhController');
const auth = require('../middlewares/auth');
const router = express.Router()

router.post('/createSheetDiemDanh', auth.veryfy, DiemDanhController.createSheetDiemDanh);
router.post('/sortSubmit', auth.veryfy, DiemDanhController.sortSubmit);
router.get('/getListSheetDiemDanh', auth.veryfy, DiemDanhController.getListSheet);
router.get('/getListMemberDiemDanh/:idSheet', auth.veryfy, DiemDanhController.getListMemberDiemDanh);

module.exports = router;