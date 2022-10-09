const { FileBox }  = require('file-box')

const ApiClient = require('./tbsdk').ApiClient
const schedule = require('../schedule')
const { wait } = require('../utils')

function Taobao(options) {
    this.options = options // 加载配置

    this.init()
}

/**
 * 初始化数据
 */
Taobao.prototype.init = function() {
    this.materials = new Map() // 初始化物料缓存
    this.materialPage = new Map() // 初始化物料id的分页数据
}

/**
 * 启动淘宝优惠分享
 * 
 * @param {WechatyInterface} bot 微信机器人对象
 */
Taobao.prototype.start = function(bot) {
    if (!this.options.enable) {
        return
    }

    const groups = this.options.groups
    for (let group of groups) {
        const mateiralIds = group.groupMaterialId.split(',')

        schedule.setSchedule(group.schedule, async () => {
            this.sendMessage(bot, group.groupName, mateiralIds)
        })
    }

    // 每天0点重置一下数据
    schedule.setSchedule('0 0 0 */1 * *', async () => {
        this.init()
    })
}

/**
 * 发送消息
 * 
 * @param {WechatyInterface} bot 微信机器人对象
 * @param {String} groupName 群名
 * @param {Array} materialIds 物料id数组
 */
Taobao.prototype.sendMessage = async function(bot, groupName, materialIds) {
    // 从多个物料id中随机选取一个
    const randomIndex = Math.floor(Math.random() * materialIds.length)
    const materialId = materialIds[randomIndex]

    let res = null
    try {
        res = await this.getMaterial(materialId)
        
        if (res == null) {
            return
        }

        const room = await bot.Room.find({ topic: groupName })
        if (!room) {
            console.log(`没有找到微信群：${groupName}`)
            return
        }

        let shareUrl = ''
        let couponAmount = 0

        if (res.coupon_share_url) {
            shareUrl = "https:" + res.coupon_share_url
            couponAmount = res.coupon_amount
        } else {
            shareUrl = "https:" + res.click_url
        }

        const pictUrl = "https:" + res.pict_url
        const title = res.title
        const zkFinalPrice = res.zk_final_price
        const finalPrice = (parseFloat(zkFinalPrice) - parseFloat(couponAmount)).toFixed(2)

        console.log(`分享商品：${title}`)

        // 发送图片
        const fb = FileBox.fromUrl(pictUrl)
        await room.say(fb)
        await wait(2)

        // 发送商品名和优惠
        let text = `${title}\n【在售价】¥${zkFinalPrice}\n【券后价】¥${finalPrice}`
        await room.say(text)
        await wait(Math.round(Math.random() * 3))

        // 发送淘口令
        text = await this.createTaobaoPwd(shareUrl)
        if (text === null) {
            return
        }

        const firstIndex = text.indexOf('￥')
        const lastIndex = text.indexOf('￥', firstIndex + 1)
        text = text.substring(firstIndex, lastIndex + 1)
        await room.say(text)
        await wait(2)
    } catch(e) {
        console.log(e)
        return
    }
}

/**
 * 创建淘口令
 * 接口详情：https://bigdata.taobao.com/api.htm?docId=31127&docType=2
 * 
 * @param {String} url 联盟官方渠道获取的淘客推广链接
 * @returns {String} 淘口令字符串
 */
Taobao.prototype.createTaobaoPwd = async function(url) {
    try {
        const res = await this.request('taobao.tbk.tpwd.create', {
            url,
        })

        return res.data.model
    } catch(e) {
        console.log(e)
        return null
    }
}

/**
 * 调用物料精选接口获取一条优惠数据
 * 接口详情：https://bigdata.taobao.com/api.htm?docId=33947&docType=2
 * 
 * @param {String|Number} materialId 官方的物料Id(详细物料id见：https://market.m.taobao.com/app/qn/toutiao-new/index-pc.html#/detail/10628875?_k=gpov9a)
 * @returns {Object} 优惠信息对象
 */
Taobao.prototype.getMaterial = async function (materialId) {
    if (this.materials.has(materialId) && this.materials.get(materialId).length > 0) {
        return this.materials[materialId].pop()
    }
    
    let pageNo = 1
    if (this.materialPage.has(materialId)) {
        pageNo = this.materialPage.get(materialId) + 1
    }
    this.materialPage.set(materialId, pageNo)

    try {
        const res = await this.request('taobao.tbk.dg.optimus.material', {
            'page_size': 10, // 每次取10条数据
            'page_no': pageNo,
            'adzone_id': this.options.adzoneId,
            'material_id': materialId,
        })

        if (!res.result_list) {
            return null
        }

        // 缓存数据，减少接口请求次数
        this.materials[materialId] = res.result_list.map_data;
        return this.materials[materialId].pop()
    } catch(e) {
        console.log(e)
        return null
    }
}

Taobao.prototype.request = function (apiname, params) {
    const client = new ApiClient({
        'appkey': this.options.appKey,
        'appsecret': this.options.appSecret,
        'REST_URL': 'http://gw.api.taobao.com/router/rest'
    });

    return new Promise(function(resolve, reject) {
        client.execute(apiname, params, function(error, response) {
            if (error) {
                console.log('请求接口：', apiname)
                console.log('请求参数：', params)
                reject(error)
            }

            resolve(response)
        })
    })
}

module.exports = Taobao