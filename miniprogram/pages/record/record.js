const app = getApp()
Page({
  data: {
    active: '1',
    list:[],
    nowTime: new Date(
      new Date(new Date().toLocaleDateString()).getTime()
    ).getTime() / 1000,
    weekTime: new Date(
      new Date(new Date().toLocaleDateString()).getTime() -
      7 * 24 * 3600 * 1000
    ).getTime()/1000,
    monthTime: new Date(
      new Date(new Date().toLocaleDateString()).getTime() -
      30 * 24 * 3600 * 1000
    ).getTime() / 1000,
    monthTime1: new Date(
      new Date(new Date().toLocaleDateString()).getTime() -
      90 * 24 * 3600 * 1000
    ).getTime() / 1000
  },
  handleNav(e) {
    let i = e.currentTarget.dataset.i
    this.setData({
      active: i
    },() => {
      this.getOrderList()
    })
  },
  onLoad(){
    this.getOrderList()
  },
  getOrderList() {
    app.showLoading('加载中')
    const that = this
    const {
      nowTime,
      weekTime,
      monthTime,
      monthTime1,
      active
    } = this.data
    let beginTime = ''
    switch (active) {
      case '1':
        beginTime = weekTime;
        break;
      case '2':
        beginTime = monthTime;
        break;
      case '3':
        beginTime = monthTime1;
        break;
    }
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/fetchStoreDetail' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        data: {
          beginTime,
          cutomerType: 2,
          endTime: nowTime,
          typeValue: wx.getStorageSync('mobile'),
          shopIdentys: [810983263, 810983262]
        },
        method: "POST",
        success(result) {
          app.hideLoading()
          console.log(result)
          if(result.data.code == 0){
            that.setData({
              list:result.data.result
            })
          }
        }
      })
    })
  }

})