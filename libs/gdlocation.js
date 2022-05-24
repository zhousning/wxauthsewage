const config = require('config.js')

var gdlocation = {
    //坐标上传到服务器
    uploadPoints() {
        return new Promise((resolve, reject) => {
            var cpoints = wx.getStorageSync('cpoints');
            let openid = wx.getStorageSync('openId')
            let task_log_id = wx.getStorageSync('task_log_id')
            if (openid != null && task_log_id != null && cpoints.length > 0) {
                wx.request({
                    url: config.routes.task_accept_points,
                    method: 'POST',
                    header: {
                        'Accept': "*/*",
                        'content-type': 'application/json' // 默认值
                    },
                    data: {
                        id: openid,
                        task_log_id: task_log_id,
                        points: cpoints
                    },
                    success: function (res) {
                        wx.setStorageSync('points', [])
                        wx.setStorageSync('cpoints', [])
                        resolve();
                    },
                    fail: function (res) {
                        wx.setStorageSync('points', [])
                        resolve();
                    }
                })
            } else {
                reject();
            }
        })
    },
    //获取经纬度坐标
    //按总共有200个终端，日调用量总30000
    //3s产生一个点,30s上传一次，一次上传不超过10个点
    get_location() {
        return new Promise((resolve, reject) => {
            if (wx.setScreenBrightness) {
                wx.setKeepScreenOn({
                    keepScreenOn: true // 保持屏幕常亮 true / false
                });
            }
            if (wx.startLocationUpdateBackground && wx.onLocationChange) {
                wx.startLocationUpdateBackground({
                    success: (res) => {
                        resolve();
                        wx.onLocationChange((data) => {
                            //console.log(new Date() + ' 经度:' + data.longitude + ' 纬度:' + data.latitude);
                            var currentTime = new Date().getTime();
                            var oldLocation = wx.getStorageSync('oldLocation');
                            var oldTime = wx.getStorageSync('oldTime');
                            var newLocation = data.longitude.toString().slice(0, 10) + "," + data.latitude.toString().slice(0, 9);
                            var speed = data.speed * 3.6.toFixed(3);
                            var accuracy = data.accuracy.toFixed(3);
                            var height = data.altitude.toFixed(3);
                            if (oldLocation != newLocation && currentTime - oldTime > 3000) {
                                wx.setStorageSync('oldLocation', newLocation);
                                wx.setStorageSync('oldTime', currentTime);
                                var points = wx.getStorageSync('points') || [];
                                var cpoints = wx.getStorageSync('cpoints') || [];
                                var point = {
                                    location: newLocation,
                                    locatetime: currentTime,
                                    speed: speed,
                                    accuracy: accuracy,
                                    height: height
                                }
                                points.unshift(point);
                                cpoints.unshift(point);
                                wx.setStorageSync('points', points)
                                wx.setStorageSync('cpoints', cpoints)
                                if (points.length > 10) {
                                    config.getNetwork().then(res => {
                                        gdlocation.uploadPoints()
                                    }).catch(res => {
                                        wx.setStorageSync('points', [])
                                    })
                                }
                            }
                        });
                    },
                    fail: (err) => {
                        reject();
                        wx.navigateTo({
                            url: '/pages/todos/locationauth/locationauth',
                        })
                    }
                })
            } else {
                reject();
                wx.showModal({
                    title: '提示',
                    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
                })
            }
        })
    },
}

module.exports = gdlocation