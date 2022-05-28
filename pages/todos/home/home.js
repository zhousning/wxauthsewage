// pages/todos/process/process.js
const app = getApp()

Component({
    options: {
        addGlobalClass: true
    },
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
    },
    methods: {
        handleTap() {
            wx.navigateTo({
                url: "/pages/todos/locationauth/locationauth",
            })
        }
    }
})