const auth = {
    veryfy: (req, res, next) => {
        console.log(req)
        if(req.body.key == 'lamngonzai' || req.query.key == 'lamngonzai') {
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