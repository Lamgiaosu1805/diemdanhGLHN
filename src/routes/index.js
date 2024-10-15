const testRouter = require('./test')
const memberRouter = require('./member')
const diemdanhRouter = require('./diemdanh')

const route = (app) => {
    app.use(`/test`, testRouter)
    app.use(`/member`, memberRouter)
    app.use(`/diemdanh`, diemdanhRouter)
}

module.exports = route;