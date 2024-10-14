const auth = {
    veryfy: (req, res, next) => {
        if(req.body.key == 'lamngonzai') {
            next()
        }
        else {
            res.json({
                status: false,
                message: "Không có quyền truy cập"
            })
        }
    }
}

module.exports = auth