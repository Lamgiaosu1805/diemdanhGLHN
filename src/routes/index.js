const testRouter = require('./test')
const memberRouter = require('./member')

const route = (app) => {
    app.use(`/test`, testRouter)
    app.use(`/member`, memberRouter)
}

module.exports = route;