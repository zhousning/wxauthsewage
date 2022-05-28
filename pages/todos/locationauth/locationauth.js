const app = getApp()

Page({
    onHide() {
    },

    onShow() {
    },

    data: {
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