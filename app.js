const config = require('./libs/config')

// app.js
App({
    onLaunch() {
        var that = this;
        // 展示本地存储能力
        //const logs = wx.getStorageSync('logs') || []
        //logs.unshift(Date.now())
        //wx.setStorageSync('logs', logs)

        var openId = wx.getStorageSync('openId')
        var userinfo = wx.getStorageSync('userInfo')
        if (openId && userinfo) {
            that.globalData.userInfo = userinfo
            that.globalData.hasUserInfo = true
        }

        wx.getSystemInfo({
            success: e => {
                that.globalData.StatusBar = e.statusBarHeight;
                let custom = wx.getMenuButtonBoundingClientRect();
                that.globalData.Custom = custom;
                that.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
            }
        })
    },
    getNetwork() {
        return new Promise((resolve, reject) => {
            wx.getNetworkType({
                success(res) {
                    const networkType = res.networkType
                    if (networkType === 'none') {
                        reject()
                    } else {
                        resolve()
                    }
                }
            })
        })
    },
    globalData: {
        userInfo: {},
        hasUserInfo: false,
        config: config,
        ColorList: [{
                title: '嫣红',
                name: 'red',
                color: '#e54d42'
            },
            {
                title: '桔橙',
                name: 'orange',
                color: '#f37b1d'
            },
            {
                title: '明黄',
                name: 'yellow',
                color: '#fbbd08'
            },
            {
                title: '橄榄',
                name: 'olive',
                color: '#8dc63f'
            },
            {
                title: '森绿',
                name: 'green',
                color: '#39b54a'
            },
            {
                title: '天青',
                name: 'cyan',
                color: '#1cbbb4'
            },
            {
                title: '海蓝',
                name: 'blue',
                color: '#0081ff'
            },
            {
                title: '姹紫',
                name: 'purple',
                color: '#6739b6'
            },
            {
                title: '木槿',
                name: 'mauve',
                color: '#9c26b0'
            },
            {
                title: '桃粉',
                name: 'pink',
                color: '#e03997'
            },
            {
                title: '棕褐',
                name: 'brown',
                color: '#a5673f'
            },
            {
                title: '玄灰',
                name: 'grey',
                color: '#8799a3'
            },
            {
                title: '草灰',
                name: 'gray',
                color: '#aaaaaa'
            },
            {
                title: '墨黑',
                name: 'black',
                color: '#333333'
            },
            {
                title: '雅白',
                name: 'white',
                color: '#ffffff'
            },
        ]
    }
})