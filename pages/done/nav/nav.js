// pages/todos/nav/nav.js
Component({
  options: {
    addGlobalClass: true
  },
  data: {
    TabCur: 0,
    scrollLeft:0,
    tabs: [
      {id: 0, title: '未接单'},
      {id: 1, title: '处理中'},
      {id: 2, title: '待确认'},
      {id: 3, title: '已完成'}
    ]
  },
  methods: {
    tabSelect(e) {
      this.setData({
        TabCur: e.currentTarget.dataset.id,
        scrollLeft: (e.currentTarget.dataset.id-1)*60
      })
    }
  }
})
