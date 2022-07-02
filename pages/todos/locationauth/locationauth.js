const app = getApp()

Page({
    data: {
        position_locate: false,
    },

    onLoad: function (option) {
        var that = this;
        var equipment = option.equipment
        that.setData({
            equipment: equipment
        })
    },

    onReady: function (e) {
        this.locatePosition();
/*         var mapCtx = wx.createMapContext('myMap')
        mapCtx.moveToLocation(); */
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
                setTimeout(function () {
                    const latitude = res.latitude
                    const longitude = res.longitude
                    that.setData({
                        longitude: longitude,
                        latitude: latitude,
                        position_locate: true
                    })
                    wx.hideLoading()
                }, 2000)
            },
            fail(res) {
                wx.getSetting({
                    success(res) {
                        if (res.authSetting['scope.userLocation']) {
                            wx.hideLoading()
                            wx.showToast({
                                title: '30秒后重试',
                                icon: "loading",
                                duration: 1000
                            })
                        } else {
                            wx.navigateTo({
                                url: '/pages/todos/positionauth/positionauth',
                            })
                        }
                    }
                })
            }
        })
    },


    // 当取消授权或者打开设置授权
    handleNoAuth(res) {
        setTimeout(() => {
            wx.navigateTo({
                url: '/pages/todos/auth/auth',
            })
        }, 500)
    }

})