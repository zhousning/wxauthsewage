const app = getApp()
const config = require('../../../libs/config')

Page({
    options: {
        addGlobalClass: true
    },
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        userInfo: {},
        hasUserInfo: false,
        canIUseGetUserProfile: false,
    },
    onLoad() {
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true
            })
        }
    },
    getUserProfile(e) {
        let that = this;
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        wx.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                wx.setStorageSync('userInfo', res.userInfo);
                app.globalData.userInfo = res.userInfo;
                app.globalData.hasUserInfo = true;
                that.updateUserInfo(res.userInfo);
            }
        })
    },
    getUserInfo(e) {
        // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
    updateUserInfo: function (userInfo) {
        wx.request({
            url: config.routes.updateUser + wx.getStorageSync('openId'),
            method: 'PUT',
            data: {
                nickname: userInfo.nickName,
                avatarurl: userInfo.avatarUrl,
                gender: userInfo.gender,
                city: userInfo.city,
                province: userInfo.province,
                country: userInfo.country,
                language: userInfo.language
            },
            header: {
                'Accept': "*/*",
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                wx.navigateBack({
                    delta: 1
                });
            },
            fail: function (res) {
                wx.showToast({
                  title: '调用失败',
                })
            }
        })
    }
})