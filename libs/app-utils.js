const config = require('config.js')

var appUtil = {
    validLogin: function () {
        var openId = wx.getStorageSync('openId');
        var userInfo = wx.getStorageSync('userInfo');
        if (!openId || !userInfo) {
            wx.showLoading({
                title: '登录中',
                mask: true
            })

            wx.login({
                success: function (res) {
                    wx.hideLoading();
                    if (res.code) {
                        appUtil.getOpenId(res.code);
                    } else {
                        wx.showToast({
                            icon: 'error',
                            title: '登录失败',
                        })
                    }
                },
                fail: function () {
                    wx.hideLoading();
                    wx.showToast({
                        icon: 'error',
                        title: '登录调用失败'
                    })
                }
            })
        }
    },
    getOpenId: function (code) {
        wx.showLoading({
            title: '请求中'
        })
        wx.request({
            url: config.routes.getUserId,
            method: 'POST',
            data: {
                code: code
            },
            header: {
                'Accept': "*/*",
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                var obj = res.data;
                wx.hideLoading();
                if (obj.state == 'success') {
                    wx.setStorageSync('openId', obj.openId);
                    wx.navigateTo({
                        url: '/pages/my/auth/auth',
                    })
                } else if (obj.state == 'error') {
                    wx.showModal({
                        title: '加载失败',
                        content: '请检查网络是否通畅',
                        confirmText: '重试',
                        success: function (res) {
                            if (res.confirm) {
                                appUtil.getOpenId(code);
                            }
                        }
                    })
                }
            },
            fail: function () {
                wx.showToast({
                    icon: 'error',
                    title: '请求调用失败'
                })
            }
        })
    }
}

module.exports = appUtil