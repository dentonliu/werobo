// 配置文件
module.exports = {
    // 每日说配置项（必填项）
    NAME: '', //女朋友备注姓名
    NICKNAME: '', //女朋友昵称
    MEMORIAL_DAY: '2015/04/18', //你和女朋友的纪念日
    CITY: '上海', //女朋友所在城市（城市名称，不要带“市”）
    SENDDATE: '0 19 17 * * *', //定时发送时间 每天8点06分0秒发送，规则见 /schedule/index.js
    TXAPIKEY: '', //此处须填写个人申请的天行apikey,请替换成自己的 申请地址https://www.tianapi.com/signup.html?source=474284281

    // 高级功能配置项（非必填项）
    AUTOREPLY: true, //自动聊天功能 默认开启, 关闭设置为: false
    DEFAULTBOT: '0', //设置默认聊天机器人 0 天行机器人 1 图灵机器人 2 天行对接的图灵机器人，需要到天行机器人官网充值（50元/年，每天1000次）
    AUTOREPLYPERSON: [''], //指定多个好友开启机器人聊天功能   指定好友的备注，最好不要带有特殊字符
    TULINGKEY: '图灵机器人apikey',//图灵机器人apikey,需要自己到图灵机器人官网申请，并且需要认证

    // (自定义) 如果你有 DIY 和基本的编程基础, 可以在这自己定义变量, 用于 js 文件访问, 包括设置简单的定时任务, 例如可以定义 task 数组
    // tasks: [{nick: 'personA', time: '早上', emoji: '🌝', action: 'eat xx', date: '0 0 8 * * *'}, 
    //         {nick: 'personA', time: '午饭后', emoji: '🌞', action: 'eat xx', date: '0 0 12 * * *'},
    //         {nick: 'personB', time: '晚饭前', emoji: '🌔', action: 'eat xx', date: '0 0 18 * * *'}, 
    //         {nick: 'personC', time: '睡前', emoji: '🌚', action: 'sleep', date: '0 0 22 * * *'}],

    // 定义优惠平台配置
    coupons: {
        taobao: {
            enable: true,
            appKey: '', // 淘宝开放平台申请的appkey
            appSecret: '', // 淘宝开放平台申请的appkey
            adzoneId: '', // 推广位id，格式如mm_xxx_xxx_xxx，只需要最后一个_后面的数字
            groups: [
                {groupName: '淘宝综合优惠群', groupMaterialId: '3756,28026,27446,13366,3786', schedule: '*/10 * * * * *'},
            ],
        }
    }
}
