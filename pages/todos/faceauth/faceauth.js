// pages/todos/faceauth/faceauth.js
const app = getApp()

import {
    getAuthorize,
    setAuthorize,
    throttle,
    checkVersion
} from '../../../libs/face-utils'

// 提示信息
const tips = {
    ready: '请确保光线充足,正面镜头',
    recording: '人脸识别中..',
    complete: '已识别完成',
    error: '识别失败'
}

Page({

    // 组件的属性列表
    properties: {
        // 人脸整体可信度 [0-1], 参考wx.faceDetect文档的res.confArray.global
        // 当超过这个可信度且正脸时开始录制人脸, 反之停止录制
        faceCredibility: 0.8,
        // 人脸偏移角度正脸数值参考wx.faceDetect文档的res.angleArray
        // 越接近0越正脸，包括p仰俯角(pitch点头）, y偏航角（yaw摇头), r翻滚角（roll左右倾）
        faceAngle: {
            p: 0.2,
            y: 0.2,
            r: 0.2
        },
        // 录制视频时长,不能超过30s
        duration: 3000,
        // 前置或者后置 front,back
        devicePosition: 'front',
        // 指定期望的相机帧数据尺寸 small,medium,large
        frameSize: 'medium',
        // 分辨率 low,medium,high
        resolution: 'high',
        // 闪光灯 auto,on,off,torch
        flash: 'off',
        // 检测视频帧的节流时间，默认500毫秒执行一次
        throttleFrequency: 500
    },

    /**
     * 页面的初始数据
     */
    data: {
        isReading: false, // 是否在准备中
        isRecoding: false, // 是否正在录制中
        bottomTips: '', // 底部提示文
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        this.stop()
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        this.stop()
    },


    test() {
/*         const query = wx.createSelectorQuery()
        query.select('#mycanvas')
            .fields({
                node: true,
                size: true
            })
            .exec((res) => {
                const canvas = res[0].node
                console.log(canvas)
            }) */
        var context = wx.createCanvasContext('mycanvas')

        console.log(context)
    },

    // 开启相机ctx
    async start() {
        const result = await this.initAuthorize();
        if (!result) return false;
        if (!this.ctx) this.ctx = wx.createCameraContext();
        return true;
    },

    // 准备录制
    async readyRecord() {
        if (this.data.isReading) return
        this.setData({
            isReading: true
        })
        wx.showLoading({
            title: '加载中..',
            mask: true
        })
        // 检测版本号
        const canUse = checkVersion('2.18.0', () => {
            this.triggerEvent('cannotUse')
        })
        if (!canUse) {
            wx.hideLoading()
            this.setData({
                isReading: false
            })
            return
        }

        // 启用相机
        try {
            const result = await this.start()
            if (!result || !this.ctx) throw new Error()
        } catch (e) {
            wx.hideLoading()
            this.setData({
                isReading: false
            })
            return
        }
        console.log('准备录制')
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
                this.setData({
                    isReading: false
                })
            }
        })
    },

    // 处理人脸识别数据
    processFaceData(res, frame) {
        if (res.confArray && res.angleArray) {
            const {
                global
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
            const isPitch = Math.abs(pitch) <= p;
            const isYaw = Math.abs(yaw) <= y;
            const isRoll = Math.abs(roll) <= r;
            //if (isGlobal && isPitch && isYaw && isRoll) {
            if (isGlobal) {
                console.log('人脸可信,且是正脸');
                if (this.data.isRecoding) return
                this.setData({
                    isRecoding: true
                });
                this.canvasPutImageData(frame)
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
        wx.uploadFile({
            url: app.globalData.config.routes.auth_process,
            header: {
                'Accept': "*/*",
                'content-type': 'application/json' // 默认值
            },
            filePath: filePath,
            name: 'photo',
            formData: {
                id: openid
            },
            success(result) {
                var data = JSON.parse(result.data)
                if (data.state == 'success') {
                    wx.showToast({
                        title: '认证成功',
                    })
                } else {
                    wx.showToast({
                        title: '认证失败',
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
                        console.log(res.tempFilePathm)
                        that.authProcess(res.tempFilePath)
                    },
                    fail(res) {
                        console.log('canvasToTempFilePath', res);
                    }
                })
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
        // const cameraName = 'scope.camera';
        // this.triggerEvent('noAuth', cameraName)
    },

    // 初始相机和录音权限
    async initAuthorize() {
        const cameraName = 'scope.camera';
        const scopeCamera = await getAuthorize(cameraName);
        // 未授权相机
        if (!scopeCamera) {
            // 用户拒绝授权相机
            if (!(await setAuthorize(cameraName))) this.openSetting();
            return false;
        }
        return true;
    },

    // 打开设置授权
    openSetting() {
        wx.showModal({
            title: '开启摄像头权限',
            showCancel: true,
            content: '是否打开？',
            success: (res) => {
                this.triggerEvent('noAuth', '打开设置授权')
                if (res.confirm) {
                    wx.openSetting();
                }
            }
        });
    }

})