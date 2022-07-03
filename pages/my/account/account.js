const app = getApp();
Page({
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        ColorList: app.globalData.ColorList,
        username: '',
        phone: '',
    },
    onLoad: function () {
        let that = this;
        let openid = wx.getStorageSync('openId')
        wx.showLoading({
            title: '数据加载中',
        })
        wx.request({
            url: app.globalData.config.routes.identity,
            method: 'get',
            header: {
                'Accept': "*/*",
                'content-type': 'application/json' // 默认值
            },
            data: {
                id: openid
            },
            success: function (res) {
                wx.hideLoading();
                var data = res.data
                that.setData({
                    username: data.identity,
                    phone: data.identity
                })
            }
        })
    },
    pageBack() {
        wx.navigateBack({
            delta: 1
        });
    }
});