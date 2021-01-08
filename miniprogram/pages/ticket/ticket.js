const app = getApp()
Page({
  data: {
    navList: [{
        title: '未使用',
        value: 1
      },
      {
        title: '已验证',
        value: 2
      },
      {
        title: '已过期',
        value: 3
      },
      {
        title: '作废',
        value: 4
      },
    ],
    active:1,
    list: {},
    page: 1,
    pageSize: 10
  },
  onLoad() {
    this.getTicketList(1)
  },
  handleNav(e) {
    let i = e.currentTarget.dataset.i
    this.setData({
      active: i
    },() => {
      this.getTicketList(i)
    })
  },
  getTicketList(i) {
    const that = this
    app.showLoading('加载中')
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/fetchCoupInstanceList' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        data: {
          couponStatus: [i],
          couponTypes: [1, 2, 3, 4],
          customerId: wx.getStorageSync('customerId'),
          page: that.data.page,
          pageSize: that.data.pageSize
        },
        method: "POST",
        success(result) {
          app.hideLoading()
          if (result.data.code == 0) {
            that.setData({
              list: result.data.result,
            })
          }else{
            wx.showModal({
              title:'提示',
              content:result.data.message,
              showCancel:false
            })
          }
        }
      })
    })
  },
})