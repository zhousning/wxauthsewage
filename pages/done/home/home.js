// pages/todos/process/process.js
const app = getApp()
const config = require('../../../libs/config.js')

Component({
  options: {
    addGlobalClass: true
  },
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    items: []
  },
  lifetimes: {
    attached: function () {
      let that = this;
      let openid = wx.getStorageSync('openId')
      wx.showLoading({
        title: '数据加载中',
      })
      wx.request({
        url: config.routes.task_query_plan,
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
        fail:function(res) {
          wx.showToast({
            icon: 'error',
            title: '数据加载失败',
          })
          console.log(res)
        }
      })
    },
    ready: function () {}
  },
  methods: {

  }
})