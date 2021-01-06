const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    accountList: [{
        title: '￥200',
        value: 200
      },
      {
        title: '￥300',
        value: 300
      },
      {
        title: '￥500',
        value: 500
      },
      {
        title: '￥1000',
        value: 1000
      },
    ],
    account: ''
  },
  onShow() {
    this.getUserInfo()
  },
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
          if (result.data.code == 0) {
            that.setData({
              userInfo: result.data.result
            })
          }
        }
      })
    })
  },
  selectAccount(e) {
    let dollar = e.currentTarget.dataset.i
    this.setData({
      account: dollar
    })
  },
  handlePayment() { //唤起支付
    const that = this
    if (that.data.account) {
      let data = {
        body: "会员充值" + that.data.account + '元',
        outTradeNo: 'XIAO' + Date.parse(new Date()) / 1000 + parseInt((Math.random() * 9) + 1),
        totalFee: that.data.account * 100
      }
      wx.cloud.callFunction({
        name: 'payment',
        data
      }).then(res => {
        const payment = res.result.payment
        wx.requestPayment({
          ...payment,
          success() {
            if (!that.data.userInfo.level) {
              that.updateCustomer(data.outTradeNo)
            } else {
              that.addCustomerRecord(data.outTradeNo)
            }
          },
          fail(res) {
            console.error('pay fail', res)
          }
        })
      })
    } else {
      app.showToast('请输入充值金额', 'none')
    }
  },
  //升级会员
  updateCustomer(outTradeNo) {
    const that = this
    // let randomNum = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
    app.getSign().then(res => {
      console.log(res)
      wx.request({
        url: app.baseUrl + '/open/v1/crm/createOrUpgradeMember' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        data: {
          attentionWxTime: new Date().getTime(),
          birthday: new Date().getTime(),
          consumePwd: '123456',
          customerId: wx.getStorageSync('customerId'),
          customerMainId: wx.getStorageSync('customerId'),
          loginId: wx.getStorageSync('mobile'),
          loginType: "0",
          name: wx.getStorageSync('name'),
          sex: that.data.userInfo.sex
        },
        method: "POST",
        success(result) {
          if (result.data.code == 0) {
            that.addCustomerRecord(outTradeNo)
          }
        },
        fail(err) {
          console.log('err', err)
        }
      })
    })
  },
  //客如云充值接口
  addCustomerRecord(outTradeNo) {
    const that = this
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/member/recharge' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        data: {
          customerId: wx.getStorageSync('customerId'),
          cardType: 1,
          businessType: 1,
          amount: that.data.account * 100,
          tpOrderId: outTradeNo
        },
        method: "POST",
        success(result) {
          console.log(result)
          if (result.data.code == 0) {
            wx.showModal({
              title: '提示',
              content: that.data.userInfo.level ? '充值成功' : '充值成功，欢迎加入会员',
              showCancel: false,
              success() {
                wx.navigateBack({
                  delta: 1,
                })
              }
            })
          }else{
            wx.showModal({
              title:"提示",
              content:'系统出错，请联系店员退款',
              showCancel:false
            })
          }
        }
      })
    })
  },
  handleAccout(e) {
    let account = e.detail.value
    this.setData({
      account
    })
  }
})