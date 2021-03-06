// components/camera-face/index.js
const app = getApp()

import {
    throttle,
} from './utils'

// 提示信息
const tips = {
    ready: '请确保光线充足,正面镜头',
    recording: '人脸识别中..',
    complete: '已识别完成',
    error: '识别失败'
}

Component({

    // 组件的属性列表
    properties: {
        equipment: {
            type: String,
            value: ''
        },
        longitude: {
            type: String,
            value: ''
        },
        latitude: {
            type: String,
            value: ''
        },
        // 人脸整体可信度 [0-1], 参考wx.faceDetect文档的res.confArray.global
        // 当超过这个可信度且正脸时开始录制人脸, 反之停止录制
        faceCredibility: {
            type: Number,
            value: 0.8
        },
        // 人脸偏移角度正脸数值参考wx.faceDetect文档的res.angleArray
        // 越接近0越正脸，包括p仰俯角(pitch点头）, y偏航角（yaw摇头), r翻滚角（roll左右倾）
        faceAngle: {
            type: Object,
            value: {
                p: 0.3,
                y: 0.1,
                r: 0.1
            }
        },
        // 录制视频时长,不能超过30s
        duration: {
            type: Number,
            value: 3000
        },
        // 前置或者后置 front,back
        devicePosition: {
            type: String,
            value: 'front'
        },
        // 指定期望的相机帧数据尺寸 small,medium,large
        frameSize: {
            type: String,
            value: 'medium'
        },
        // 分辨率 low,medium,high
        resolution: {
            type: String,
            value: 'high'
        },
        // 闪光灯 auto,on,off,torch
        flash: {
            type: String,
            value: 'off'
        },
        // 检测视频帧的节流时间，默认2000毫秒执行一次
        throttleFrequency: {
            type: Number,
            value: 2000
        }
    },

    // 组件页面的生命周期
    pageLifetimes: {
        // 页面被隐藏
        hide: function () {
            this.stop()
        },
    },
    detached: function () {
        // 在组件实例被从页面节点树移除时执行
        this.stop()
    },

    // 组件的初始数据
    data: {
        isRecoding: false, // 是否正在录制中
        bottomTips: '', // 底部提示文字
    },

    lifetimes: {
        attached: function () {
            this.ctx = wx.createCameraContext();
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        hideModal(e) {
            this.setData({
                modalName: null
            })
        },
        // 准备录制
        async readyRecord() {
            if (!this.ctx) return;
            wx.showLoading({
                title: '加载中..',
                mask: true
            })

            this.setData({
                bottomTips: tips.ready
            })
            // 视频帧回调节流函数
            let fn = throttle((frame) => {
                // 人脸识别
                wx.faceDetect({
                    frameBuffer: frame.data,
                    width: frame.width,
                    height: frame.height,
                    enableConf: true,
                    enableAngle: true,
                    success: (res) => this.processFaceData(res, frame),
                    fail: (err) => this.cancel()
                })
            }, this.properties.throttleFrequency);

            // 初始化人脸识别
            wx.initFaceDetect({
                success: () => {
                    const listener = this.listener = this.ctx.onCameraFrame((frame) => fn(frame));
                    listener.start();
                },
                fail: (err) => {
                    this.setData({
                        bottomTips: ''
                    })
                    wx.showToast({
                        title: '初始人脸识别失败',
                        icon: 'none'
                    })
                },
                complete: () => {
                    wx.hideLoading()
                }
            })
        },

        // 处理人脸识别数据
        processFaceData(res, frame) {
            if (res.confArray && res.angleArray) {
                const {
                    global,
                    leftEye,
                    mouth,
                    nose,
                    rightEye
                } = res.confArray;
                const g = this.properties.faceCredibility;
                const {
                    pitch,
                    yaw,
                    roll
                } = res.angleArray;
                const {
                    p,
                    y,
                    r
                } = this.properties.faceAngle;
                console.log('res.confArray.global:', global)
                console.log('res.angleArray:', pitch, yaw, roll)
                const isGlobal = global >= g;
                const isPitch = Math.abs(pitch) >= p;
                const isYaw = Math.abs(yaw) >= y;
                const isRoll = Math.abs(roll) >= r;
                if (this.data.isRecoding) return
                if (isGlobal) {
                    if (isPitch || isYaw || isRoll) {
                        this.setData({
                            bottomTips: '请平视摄像头'
                        });
                    } else if (global <= 0.8 || leftEye <= 0.8 || mouth <= 0.8 || nose <= 0.8 || rightEye <= 0.8) {
                        this.setData({
                            bottomTips: '请勿遮挡五官'
                        });
                    } else {
                        this.setData({
                            isRecoding: true,
                            bottomTips: '签到中...'
                        });
                        this.canvasPutImageData(frame)
                    }
                } else {
                    console.log('人脸不可信,或者不是正脸');
                    this.cancel()
                }
            } else {
                console.log('获取人脸识别数据失败', res);
                this.cancel()
            }
        },

        authProcess(filePath) {
            let that = this;
            let openid = wx.getStorageSync('openId')
            let equipment = that.properties.equipment
            let longitude = that.properties.longitude
            let latitude = that.properties.latitude
            wx.uploadFile({
                url: app.globalData.config.routes.auth_process,
                header: {
                    'Accept': "*/*",
                    'content-type': 'application/json' // 默认值
                },
                filePath: filePath,
                name: 'photo',
                formData: {
                    id: openid,
                    equipment: equipment,
                    longitude: longitude,
                    latitude: latitude,
                },
                success(result) {
                    var data = JSON.parse(result.data)
                    if (data.state == 'success') {
                        wx.showModal({
                            title: '已签到',
                            content: data.name,
                            showCancel: false
                        })
                    } else {
                        wx.showModal({
                            title: '签到失败',
                            showCancel: false
                        })
                    }
                },
                complete() {
                    that.stop();
                }
            })
        },
        // 生成图片上传人脸
        canvasPutImageData(frame) {
            const that = this
            // 绘制画布
            var data = new Uint8Array(frame.data);
            var clamped = new Uint8ClampedArray(data);
            wx.canvasPutImageData({
                canvasId: 'mycanvas',
                x: 0,
                y: 0,
                width: frame.width,
                heihgt: frame.heihgt,
                data: clamped,
                success() {
                    wx.canvasToTempFilePath({
                        canvasId: 'mycanvas',
                        x: 0,
                        y: 0,
                        width: frame.width,
                        heihgt: frame.heihgt,
                        fileType: 'jpg',
                        destWidth: frame.width,
                        destHeight: frame.height,
                        quality: 0.8,
                        success(res) {
                            that.authProcess(res.tempFilePath)
                        },
                        fail(res) {
                            console.log('canvasToTempFilePath', res);
                        }
                    }, that)
                },
                fail(res) {
                    console.log('canvasPutImageData', res);
                }
            }, that)
        },
        // 人脸移出等取消录制
        cancel() {
            // 如果不在录制中或者正在录制完成中就不能取消
            if (!this.data.isRecoding) return
            console.log('取消录制');
            this.setData({
                bottomTips: tips.ready,
                isRecoding: false
            });
        },
        // 用户切入后台等停止使用摄像头
        stop() {
            console.log('停止录制');
            if (this.listener) this.listener.stop();
            wx.stopFaceDetect();
            setTimeout(() => {
                this.setData({
                    bottomTips: '',
                    isRecoding: false
                })
            }, 500)
        },

        // 用户不允许使用摄像头
        error(e) {
            this.triggerEvent('noAuth')
        },

    }
})