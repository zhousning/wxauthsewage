// pages/todos/process/process.js
const app = getApp()

Component({
    options: {
        addGlobalClass: true
    },
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
    },
    lifetimes: {
        attached: function () {
            let that = this;
            let openid = wx.getStorageSync('openId')
            wx.showLoading({
                title: '数据加载中',
            })
            wx.request({
                url: app.globalData.config.routes.task_query_all,
                method: 'GET',
                header: {
                    'Accept': "*/*",
                    'content-type': 'application/json' // 默认值
                },
                data: {
                    id: openid
                },
                success: function (res) {
                    that.setData({
                        items: res.data
                    })
                    wx.hideLoading()
                },
                fail: function (res) {
                    wx.showToast({
                        icon: 'error',
                        title: '数据加载失败',
                    })
                }
            })
        },
    }
})