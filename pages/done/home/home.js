// pages/todos/process/process.js
const app = getApp()

Component({
    options: {
        addGlobalClass: true
    },
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        site_name: '',
        site_id: null,
        task_id: null,
        state: '0',
        username: '',
        phone: '',
        idno: '',
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
    lifetimes: {
        attached: function () {},
        ready: function () {}
    },
    methods: {
        // 获取输入账号 
        usernameInput: function (e) {
            this.setData({
                username: e.detail.value
            })
        },

        // 获取输入密码 
        phoneInput: function (e) {
            this.setData({
                phone: e.detail.value
            })
        },
        idnoInput: function (e) {
            this.setData({
                idno: e.detail.value
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
                count: 1, //默认9
                sizeType: ['original'], //可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album','camera'], //从相册选择album, 拍照camera
                success: (res) => {
                    wx.uploadFile({
                        url: app.globalData.config.routes.img_upload,
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
            var username = that.data.username
            var phone = that.data.phone
            var idno = that.data.idno
            var state = that.data.state
            var question = that.data.question
            var imgs = that.data.images

            if (that.data.username.length == 0 || that.data.phone.length == 0 || that.data.idno.length == 0 ) {
                wx.showToast({
                    title: '姓名/电话/身份证不能为空',
                    icon: 'none',
                    duration: 2000
                })
            } else if (imgs.length < 4) {
                wx.showToast({
                    title: '证件照不全',
                    icon: 'none',
                    duration: 2000
                })
            } else {
                wx.showLoading({
                    title: '数据保存中',
                })
                wx.request({
                    url: app.globalData.config.routes.task_report_create,
                    method: 'POST',
                    header: {
                        'Accept': "*/*",
                        'content-type': 'application/json' // 默认值
                    },
                    data: {
                        id: openid,
                        username: username,
                        phone: phone,
                        idno: idno,
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
        }
    }
})