// pages/todos/detail/detail.js
const app = getApp()
const config = require('../../../libs/config.js')

Page({
  options: {
    addGlobalClass: true
  },
  /**
   * 页面的初始数据
   */
  data: {
    task: null,
    inspectors: [],
    reports: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    var task_id = options.task_id
    let openid = wx.getStorageSync('openId')
    wx.showLoading({
      title: '数据加载中',
      mask: true,
    })
    wx.request({
      url: config.routes.task_info,
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
        that.setData({
          task: res.data.task,
          inspectors: res.data.inspectors,
          reports: res.data.reports
        })
        wx.hideLoading()
      },
      fail: function (res) {
        wx.hideLoading()
        console.log(res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  previewImage: function(e) {
    wx.previewImage({
      urls: e.currentTarget.dataset.urls,
      current: e.currentTarget.dataset.url
    })
  }
})