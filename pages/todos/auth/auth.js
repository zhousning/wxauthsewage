const app = getApp()

Page({
    options: {
        addGlobalClass: true
    },
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
    },

    openSetting() {
        wx.openSetting()
    }
})