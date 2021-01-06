const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    accountList:[
      {
        title:'￥200',
        value:200
      },
      {
        title:'￥300',
        value:300
      },
      {
        title:'￥500',
        value:500
      },
      {
        title:'￥1000',
        value:1000
      },
    ],
    account:''
  },
  onShow(){
    this.getUserInfo()
  },
  getUserInfo(){
    const that = this
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/getCustomerDetailById' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        data:{
          customerId:wx.getStorageSync('customerId')
        },
        method: "POST",
        success(result){
          if(result.data.code == 0){
            that.setData({
              userInfo:result.data.result
            })
          }
        }
      })
    })
  },
  selectAccount(e){
    let dollar = e.currentTarget.dataset.i
    this.setData({
      account:dollar
    })
  },
  handlePayment() {//唤起支付
    let data = {
      body: "test",
      outTradeNo: 'XIAO' + Date.parse(new Date()) / 1000 + parseInt((Math.random() * 9) + 1),
      totalFee: 1
    }
    wx.cloud.callFunction({
      name: 'payment',
      data
    }).then(res => {
      const payment = res.result.payment
      wx.requestPayment({
        ...payment,
        success(res) {
          console.log('pay success', res)
        },
        fail(res) {
          console.error('pay fail', res)
        }
      })
    })
  },
})