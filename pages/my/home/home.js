const app = getApp()
const appUtils = require('../../../libs/app-utils.js');
Component({
    options: {
        addGlobalClass: true,
    },
    data: {
        userInfo: {},
        hasUserInfo: false,
    },
    lifetimes: {
        attached() {
          let that = this;
          if (app.globalData.hasUserInfo) {
            that.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
          }
        }
    },
    pageLifetimes: {
        //微信授权后navigatback回来执行的是页面的show，组件之间切换执行的attached，所以这两个方法都要加
        show() {
          let that = this;
          if (app.globalData.hasUserInfo) {
            that.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
          }
        }
    },
    methods: {
        LogOut() {
            let that = this;
            wx.showModal({
                title: '确认退出？',
                content: '',
                confirmText: '确定',
                success: function (res) {
                    if (res.confirm) {
                        wx.removeStorageSync('openId')
                        wx.removeStorageSync('userInfo')
                        app.globalData.userInfo = null
                        app.globalData.hasUserInfo = false
                        that.setData({
                            userInfo: {},
                            hasUserInfo: false
                        })

                    }
                }
            })
        },
        LogIn() {
            appUtils.validLogin();
        }
    }
})