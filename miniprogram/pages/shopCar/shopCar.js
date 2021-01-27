const app = getApp()
Page({
  data: {
    addressList: [],
    defaultAddress: {},
    userInfo: {},
    totalPrice: 0,
    showPaymethods: false,
    paymethodName: '微信支付',
    actions: [{
        name: '微信支付',
      },
      {
        name: '余额支付',
      },
    ],
    shopCarList: []
  },
  onLoad() {
    this.getAddressList()
    this.getUserInfo()
  },
  getAddressList() {
    const that = this
    const db = wx.cloud.database()
    db.collection('customer_address').where({
        user_id: wx.getStorageSync('customerId')
      })
      .get({
        success: function (res) {
          console.log(res)
          if (res.data.length != 0) {
            res.data.forEach(el => {
              if (el.isdefault) {
                that.setData({
                  defaultAddress: el,
                  addressList: res.data
                })
              }
            });
          }
        }
      })
  },
  onClose() {
    this.setData({
      showPaymethods: false
    });
  },
  onSelect(event) {
    if (event.detail.name == '微信支付') {
      this.setData({
        paymethodName: event.detail.name
      })
    } else {
      this.setData({
        paymethodName: '余额支付'
      })
    }
  },
  //用户信息
  getUserInfo() {
    const that = this
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/getCustomerDetailById' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        data: {
          customerId: wx.getStorageSync('customerId')
        },
        method: "POST",
        success(result) {
          wx.hideNavigationBarLoading()
          if (result.data.code == 0) {
            that.setData({
              userInfo: result.data.result,
            }, () => {
              that.getShopCarList()
            })
          }
        }
      })
    })
  },
  //购物车列表
  getShopCarList() {
    const that = this
    const db = wx.cloud.database()
    db.collection('customer_shopcar').where({
        user_id: wx.getStorageSync('customerId')
      })
      .get({
        success: function (res) {
          let totalPrice = 0
          let actions = that.data.actions
          let userInfo = that.data.userInfo
          let paymethodName = ''
          res.data[0].data.forEach(el => {
            totalPrice += el.price * el.totalNum
          })
          if ((totalPrice > userInfo.remainValue) || !userInfo.level) {
            actions[1].disabled = true
            actions[1].name = '余额不足' + '(' + userInfo.remainValue + '元)'
            paymethodName = '微信支付'
          } else {
            actions[1].name = '余额支付' + '(余额' + userInfo.remainValue + '元)'
            paymethodName = '余额支付'
          }
          that.setData({
            shopCarList: res.data[0],
            actions,
            paymethodName,
            totalPrice
          })
        }
      })
  },
  changePayMethod() {
    let bool = this.data.showPaymethods
    this.setData({
      showPaymethods: !bool
    })
  }
})