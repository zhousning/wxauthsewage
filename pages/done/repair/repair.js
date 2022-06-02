// pages/done/repair/repair.js
const config = require('../../../libs/config')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    site_name: '',
    site_id: null,
    task_id: null,
    state: '0',
    longitude: '',
    latitude: '',
    markers: [],
    question: '',
    imgList: [],
    images: [],
    index: 0,
    picker: [],
    running: [{
        text: '男',
        value: '0',
        checked: 'true'
      },
      {
        text: '女',
        value: '1'
      },
    ],
    textareaAValue: ''
  },
  onLoad: function (option) {
    var that = this;
    var openid = wx.getStorageSync('openId');
    var fct_id = option.fct_id
    var device_id = option.device_id

    wx.showLoading({
      title: '数据加载中',
    })
    wx.request({
      url: config.routes.task_basic_card,
      header: {
        'Accept': "*/*",
        'content-type': 'application/json' // 默认值
      },
      data: {
        id: openid,
        fct_id: fct_id,
        device_id: device_id
      },
      success: function (res) {
        wx.hideLoading();
        var obj = res.data
        if (obj) {
          var array = []
          obj.tasks.forEach(element => {
            array.push(element)
          });
          that.setData({
            picker: array,
            site_name: obj.device.name,
            site_id: obj.device.id
          })
        } else {
          wx.showToast({
            title: '数据加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (e) {
        wx.hideLoading();
      }
    })
  },
  onReady: function (e) {
    var mapCtx = wx.createMapContext('myMap')
    this.locatePosition();
    mapCtx.moveToLocation();
  },
  locatePosition() {
    let that = this;
    wx.showLoading({
      title: '定位中',
    })
    wx.getLocation({
      type: 'gcj02 ',
      isHighAccuracy: true,
      highAccuracyExpireTime: 5000,
      success(res) {
        wx.hideLoading()
        const latitude = res.latitude
        const longitude = res.longitude
        var marker = {
          id: 1,
          latitude: res.latitude,
          longitude: res.longitude,
          iconPath: '/images/location.png',
        }
        that.setData({
          longitude: longitude,
          latitude: latitude,
          //markers: [marker]
        })
        wx.showToast({
          icon: 'success',
          title: '定位成功',
        })
      },
      fail(res) {
        wx.hideLoading()
        wx.showToast({
          title: '30秒后重试',
          icon: "loading",
          duration: 1000
        })
      }
    })
  },
  PickerChange(e) {
    this.setData({
      index: e.detail.value
    })
  },
  textareaAInput(e) {
    this.setData({
      question: e.detail.value
    })
  },
  ChooseImage() {
    let that = this;
    let openid = wx.getStorageSync('openId')
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], //从相册选择album, 拍照camera
      success: (res) => {
        wx.uploadFile({
          url: config.routes.img_upload,
          header: {
            'Accept': "*/*",
            'content-type': 'application/json' // 默认值
          },
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
              id: openid
          },
          success(result) {
            var data = JSON.parse(result.data)
            if (data.state == 'success') {
              that.setData({
                imgList: that.data.imgList.concat(res.tempFilePaths[0]),
                images: that.data.images.concat(data.url)
              })
            } else {
              wx.showToast({
                title: '上传失败',
              })
            }
          }
        })
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      content: '确定删除？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.data.images.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList,
            images: this.data.images
          })
        }
      }
    })
  },
  radioChange(e) {
    const items = this.data.running
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].value === e.detail.value
    }
    this.setData({
      state: e.detail.value
    })
  },
  bindFormSubmit(e) {
    let that = this
    var openid = wx.getStorageSync('openId');
    var task_id = that.data.picker[that.data.index].task_id
    var site_id = that.data.site_id
    var longitude = that.data.longitude
    var latitude = that.data.latitude
    var state = that.data.state
    var question = that.data.question
    var imgs = that.data.images

    wx.showLoading({
      title: '数据保存中',
    })
    wx.request({
      url: config.routes.task_report_create,
      method: 'POST',
      header: {
        'Accept': "*/*",
        'content-type': 'application/json' // 默认值
      },
      data: {
        id: openid,
        task_id: task_id,
        site_id: site_id,
        longitude: longitude,
        latitude: latitude,
        state: state,
        question: question,
        imgs: imgs
      },
      success: function (res) {
        wx.hideLoading();
        var obj = res.data
        if (obj.state == 'success') {
          wx.showToast({
            title: '保存成功',
            duration: 3000,
            success: function () {
              setTimeout(() => {
                wx.redirectTo({
                  url: '../../index/index',
                })
              }, 3000);
            }
          })
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (e) {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})