// pages/todos/process/process.js
const app = getApp()
const config = require('../../../libs/config.js')
const gdlocation = require('../../../libs/gdlocation.js')

Component({
    options: {
        addGlobalClass: true
    },
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        items: [],
        points: [],
        start_time: '',
        end_time: '',
        task_log_id: ''
    },
    lifetimes: {
        attached: function () {
            let that = this;
            let openid = wx.getStorageSync('openId')
            wx.showLoading({
                title: '数据加载中',
                mask: true,
            })
            wx.request({
                url: config.routes.task_query_all,
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
                    wx.hideLoading()
                    console.log(res)
                }
            })
        }
    },
    methods: {
        //任务开始
        task_start(e) {
            let that = this
            var task_id = e.currentTarget.dataset.task
            let openid = wx.getStorageSync('openId')
            wx.showLoading({
                title: '任务开启中',
                mask: true,
            })
            wx.request({
                url: config.routes.task_start,
                method: 'GET',
                header: {
                    'Accept': "*/*",
                    'content-type': 'application/json' // 默认值
                },
                data: {
                    id: openid,
                    task_id: task_id
                },
                success: function (res) {
                    wx.hideLoading()
                    var obj = res.data
                    if (obj.state == 'success') {
                        that.setData({
                            task_log_id: obj.task_log_id
                        })
                        wx.setStorageSync('task_log_id', obj.task_log_id)
                        gdlocation.get_location()
                    } else {
                        wx.showToast({
                            icon: 'error',
                            title: '开启失败',
                        })
                    }
                },
                fail: function (res) {
                    wx.hideLoading()
                    wx.showToast({
                        title: '网络错误',
                        duration: 3000
                    })
                }
            })
        },
        //到达站点
        task_end(e) {
            let that = this
            var task_id = e.currentTarget.dataset.task
            let openid = wx.getStorageSync('openId')
            let task_log_id = wx.getStorageSync('task_log_id')
            wx.showLoading({
                title: '结束中',
                mask: true,
            })
            wx.request({
                url: config.routes.task_end,
                method: 'GET',
                header: {
                    'Accept': "*/*",
                    'content-type': 'application/json' // 默认值
                },
                data: {
                    id: openid,
                    task_id: task_id,
                    task_log_id: task_log_id,
                },
                success: function (res) {
                    wx.hideLoading()
                    var obj = res.data
                    if (obj.state == 'success') {
                        if (wx.stopLocationUpdate) {
                            wx.stopLocationUpdate({
                                success: (res) => {
                                    gdlocation.uploadPoints()
                                    that.setData({
                                        task_log_id: null
                                    })
                                    wx.removeStorageSync('task_log_id')
                                },
                            })
                        } else {
                            wx.showModal({
                                title: '提示',
                                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
                            })
                        }
                    } else {
                        wx.showToast({
                            icon: 'error',
                            title: '结束失败',
                        })
                    }
                },
                fail: function (res) {
                    wx.hideLoading()
                    wx.showToast({
                        title: '网络错误',
                        duration: 3000
                    })
                }
            })

        }
    }
})