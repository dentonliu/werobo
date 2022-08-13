const config = require('../config/index.js')
const Taobao = require('./taobao')


function startCoupon(bot) {
    if (!config.coupons) {
        return
    }

    taobao = new Taobao(config.coupons.taobao || {})
    taobao.start(bot)
}

module.exports = startCoupon