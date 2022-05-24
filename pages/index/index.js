// index.js
// 获取应用实例
const app = getApp()

Page({
    data: {
        PageCur: 'todos'
    },
    onShow() {
        let that = this;
        if (!app.globalData.hasUserInfo) {
            that.setData({
                PageCur: 'my'
            })
        }
    },
    NavChange(e) {
        let that = this;
        if (app.globalData.hasUserInfo) {
            if (app.globalData.task_ongoing) {
                wx.showToast({
                    icon: 'loading',
                    title: '有任务',
                })
            } else {
                that.setData({
                    PageCur: e.currentTarget.dataset.cur
                })
            }
        } else {
            that.setData({
                PageCur: 'my'
            })
        }
    },
    scanRepair() {
        let that = this;
        if (app.globalData.hasUserInfo) {
            if (app.globalData.task_ongoing) {
                wx.showModal({
                    title: '提示',
                    content: '请先结束任务',
                    success: function (res) {
                        if (res.confirm) {}
                    }
                })
            } else {
                wx.scanCode({
                    onlyFromCamera: true,
                    success: (res) => {
                        //url http://47.104.153.152/factories/16284/devices/16878/info
                        var result = res.result
                        var url_reg = /http:\/\/dtxcx.swgysw.com\/factories\/(\d+)\/devices\/(\d+)\/info/
                        var pattern = url_reg.test(result)
                        if (pattern) {
                            var fct_id_reg = /factories\/(\d+)\//
                            var device_id_reg = /devices\/(\d+)\//
                            var fct_id = result.match(fct_id_reg)[1]
                            var device_id = result.match(device_id_reg)[1]
                            wx.navigateTo({
                                url: '/pages/done/repair/repair?fct_id=' + fct_id + '&device_id=' + device_id
                            })
                        } else {
                            wx.showToast({
                                title: '非农污二维码',
                                duration: 3000,
                                icon: 'loading'
                            })
                        }
                    }
                })
            }
        } else {
            that.setData({
                PageCur: 'my'
            })
        }
    }
})