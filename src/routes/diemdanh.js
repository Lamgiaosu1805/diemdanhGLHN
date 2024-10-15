const express = require('express');
const DiemDanhController = require('../controllers/DiemdanhController');
const auth = require('../middlewares/auth');
const router = express.Router()

router.post('/createSheetDiemDanh', auth.veryfy, DiemDanhController.createSheetDiemDanh);
router.get('/getListSheetDiemDanh', auth.veryfy, DiemDanhController.getListSheet);

module.exports = router;