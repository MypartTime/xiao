const app = getApp()
var md5 = require('md5');

Page({
  data: {
    addressList: [],
    defaultAddress: {},
    userInfo: {},
    totalPrice: 0, //总价
    totalNum: 0, //总数量
    showPaymethods: false,
    addressShow: false,
    paymethodName: '微信支付',
    isFocus: false, //密码输入框聚焦
    showPwd: false,
    pwd: '',
    actions: [{
        name: '微信支付',
      },
      {
        name: '余额支付',
      },
    ],
    shopCarList: []
  },
  onShow() {
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
          let defaultAddress = {}
          let addressList = res.data
          if (addressList.length != 0) {
            addressList.forEach(el => {
              el.name = el.address_name + ' ' + el.addressDetail
              el.subname = el.user_name + ' ' + el.mobile
              if (el.isdefault) {
                defaultAddress = el
              }
            });
            if (!defaultAddress._id) {
              defaultAddress = addressList[0]
            }
          }
          that.setData({
            defaultAddress,
            addressList
          })
        }
      })
  },
  //支付方式控制
  onClose() {
    this.setData({
      showPaymethods: false
    });
  },
  //选择支付方式
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
  //关闭选择地址
  addressClose() {
    this.setData({
      addressShow: false
    })
  },
  //选择地址
  addressSelect(e) {
    this.setData({
      defaultAddress: e.detail
    })
  },
  //显示地址选择
  handleAddress() {
    this.setData({
      addressShow: true
    })
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
    app.showLoading('加载中')
    db.collection('customer_shopcar').where({
        user_id: wx.getStorageSync('customerId')
      })
      .get({
        success: function (res) {
          app.hideLoading()
          let totalPrice = 0
          let totalNum = 0
          let actions = that.data.actions
          let userInfo = that.data.userInfo
          let paymethodName = ''
          res.data[0].data.forEach(el => {
            totalPrice += el.price * el.totalNum
            totalNum += el.totalNum
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
            totalPrice: totalPrice.toFixed(2),
            totalNum
          })
        }
      })
  },
  changePayMethod() {
    let bool = this.data.showPaymethods
    this.setData({
      showPaymethods: !bool
    })
  },
  closePwd() {
    this.setData({
      showPwd: false,
    })

  },
  handleOrder() {
    if (this.data.defaultAddress._id && this.data.paymethodName == '微信支付') {
      console.log('微信支付')
      this.handlePayment()
    } else if (this.data.defaultAddress._id && this.data.paymethodName == '余额支付') {
      console.log('余额支付')
      this.setData({
        showPwd: true,
      })
      setTimeout(() => {
        this.setData({
          isFocus: true
        })
      }, 200)
    }
  },
  createOrder() {
    const that = this
    let dishList = []
    let defaultAddress = this.data.defaultAddress
    this.data.shopCarList.data.forEach(el => {
      dishList.push({
        name: el.name,
        id: el.id,
        type: 0,
        tpId: el.id,
        quantity: el.totalNum,
        price: that.accMul(el.price, 100),
        packagePrice: 0,
        packageQuantity: 0,
        totalFee: that.accMul(that.accMul(el.price, el.totalNum), 100)
      })
    })
    let delivery = {
      expectTime: 0, //期望送达时间,自提预约取货，时间戳，精确到秒，为0则立即送餐
      deliveryParty: 1, //配送方式,1:商家自配（商户自己配送或通过客如云接入的第三方配送平台）,2:平台配送,3:自提
      receiverName: defaultAddress.user_name,
      receiverPhone: defaultAddress.mobile,
      delivererAddress: defaultAddress.address_name + defaultAddress.addressDetail,
      coordinateType: 1,
      longitude: defaultAddress.longitude,
      latitude: defaultAddress.latitude
    }
    let payment = {
      memberId: wx.getStorageSync('customerId'),
      memberPassword: this.data.paymethodName == '余额支付'?md5(this.data.userInfo.memo):'',
      totalFee: that.accMul(this.data.totalPrice, 100) + 500, //订单总价，订单总价=商品总金额+餐盒费+配送费，单位：分
      deliveryFee: 500, //配送费
      packageFee: 0, //餐盒费
      discountFee: 0,
      platformDiscountFee: 0,
      shopDiscountFee: 0,
      shopFee: that.accMul(this.data.totalPrice, 100) + 500, //商户实收总价
      userFee: that.accMul(this.data.totalPrice, 100) + 500, //用户实付总价
      serviceFee: 0,
      subsidies: 0,
      payType: 2,
    }
    // return
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/takeout/order/create' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        data: {
          tpOrderId: 'XIAO' + Date.parse(new Date()) / 1000 + parseInt((Math.random() * 9) + 1), //订单号
          createTime: new Date().getTime(), //创建时间
          peopleCount: 1,
          shop: {
            shopIdenty: app.shopIdenty,
            tpShopId: app.shopIdenty,
            shopName: app.shopName
          },
          products: dishList,
          delivery,
          payment,
          isPrint: 1
        },
        method: "POST",
        success(result) {
          console.log(result)
          app.hideLoading()
          if (result.data.code == 0) {
            wx.showModal({
              title: '提示',
              content: '订单提交成功，请等待送达',
              showCancel: false
            })
            const db = wx.cloud.database()
            db.collection('customer_order').add({
              data: {
                name: that.data.userInfo.customerName,
                mobile: wx.getStorageSync('mobile'),
                create_time: new Date().toDateString(),
                account: that.data.totalPrice * 1 + 5 * 1,
                level: that.data.userInfo.level,
                payment: that.data.paymethodName,
                overage: that.data.paymethodName == '微信支付' ? that.data.userInfo.remainValue : (that.data.userInfo.remainValue - that.data.totalPrice - 5).toFixed(2),
                orderId: result.data.result.orderId,
                tradeId: result.data.result.tradeId,
              }
            }).then(res => {
              console.log(res)
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false
            })
          }
        }
      })
    })
  },
  accMul(arg1, arg2) {
    var m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length
    } catch (e) {}
    try {
      m += s2.split(".")[1].length
    } catch (e) {}
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
  },
  //控制密码输入
  inputPwd(e) {
    let pwd = e.detail.value
    console.log(pwd)
    if (pwd.length == 6 && this.data.userInfo.memo == pwd) {
      console.log('密码正确，余额支付')
      app.showLoading('')
      this.setData({
        showPwd:false
      })
      this.createOrder()
    }else if(pwd.length == 6 && this.data.userInfo.memo != pwd){
      app.showToast('密码错误，请重试','none')
    }
  },
  handleInputClear() {
    this.setData({
      pwd: ''
    })
  },
  //唤起支付
  handlePayment() {
    const that = this
    let data = {
      body: "小程序支付" + (that.data.totalPrice * 1 + 5) + '元',
      outTradeNo: 'XIAO' + Date.parse(new Date()) / 1000 + parseInt((Math.random() * 9) + 1),
      totalFee: that.data.totalPrice * 100 + 500
    }
    wx.cloud.callFunction({
      name: 'payment',
      data
    }).then(res => {
      const payment = res.result.payment
      wx.requestPayment({
        ...payment,
        success() {
          that.handleGoodsOrder(2)
        },
        fail(res) {
          console.error('pay fail', res)
        }
      })
    })

  },
})