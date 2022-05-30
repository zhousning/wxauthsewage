const app = getApp()

Page({
    data: {},

    onLoad: function (option) {
        var that = this;
        var equipment = option.equipment
        that.setData({
            equipment: equipment
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