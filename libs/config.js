var configs = {
  routes: {
    /*getUserId: 'https://www.bafangjie.cn/wx_users/get_userid',
    updateUser: 'https://www.bafangjie.cn/wx_users/',
    getUserId: 'http://192.168.31.20:3000/wx_users/get_userid',*/
    host: 'http://192.168.31.20:3000/',
    getUserId: 'http://192.168.31.20:3000/wx_users/get_userid',
    updateUser: 'http://192.168.31.20:3000/wx_users/',
    getUserInfo: 'http://192.168.31.20:3000/wx_users/get_user_info',
    fcts: 'http://192.168.31.20:3000/wx_users/fcts',
    streets: 'http://192.168.31.20:3000/wx_users/streets',
    sites: 'http://192.168.31.20:3000/wx_users/sites',
    status: 'http://192.168.31.20:3000/wx_users/status',
    set_fct: 'http://192.168.31.20:3000/wx_users/set_fct',
    img_upload: 'http://192.168.31.20:3000/wx_resources/img_upload',
    task_query_all: 'http://192.168.31.20:3000/wx_tasks/query_all',
    task_query_finish: 'http://192.168.31.20:3000/wx_tasks/query_finish',
    task_query_plan: 'http://192.168.31.20:3000/wx_tasks/query_plan',
    task_basic_card: 'http://192.168.31.20:3000/wx_tasks/basic_card',
    task_info: 'http://192.168.31.20:3000/wx_tasks/task_info',
    task_start: 'http://192.168.31.20:3000/wx_task_logs/task_start',
    task_end: 'http://192.168.31.20:3000/wx_task_logs/task_end',
    task_report_create: 'http://192.168.31.20:3000/wx_tasks/report_create',
    task_accept_points: 'http://192.168.31.20:3000/wx_task_logs/accept_points',
    auth_process: 'http://192.168.31.20:3000/wx_auths/auth_process',
  },
  getNetwork() {
    return new Promise((resolve, reject) => {
      wx.getNetworkType({
        success(res) {
          const networkType = res.networkType
          if (res.networkType === 'none') {
            reject()
          } else {
            resolve()
          }
        }
      })
    })
  },
  games: {
    rankScore: 10,
    changeQuestionTime: 100,
    tollGate: 60
  }
}

module.exports = configs