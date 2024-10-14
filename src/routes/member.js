const express = require('express');
const auth = require('../middlewares/auth');
const MemberController = require('../controllers/MemberController');
const router = express.Router()

router.post('/createMember', auth.veryfy, MemberController.createMember);
module.exports = router;