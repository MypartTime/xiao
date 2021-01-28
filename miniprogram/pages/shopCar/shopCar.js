const app = getApp()
var md5 = require('md5');

Page({
  data: {
    addressList: [],
    defaultAddress: {},
    userInfo: {},
    totalPrice: 0,
    showPaymethods: false,
    addressShow: false,
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
  addressClose() {
    this.setData({
      addressShow: false
    })
  },
  addressSelect(e) {
    this.setData({
      defaultAddress: e.detail
    })
  },
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
        price: el.price * 100,
        packagePrice: 100,
        packageQuantity: 1,
        totalFee: el.totalNum * el.price * 100
      })
    })
    let delivery = {
      expectTime: 0, //期望送达时间,自提预约取货，时间戳，精确到秒，为0则立即送餐
      deliveryParty: 1, //配送方式,1:商家自配（商户自己配送或通过客如云接入的第三方配送平台）,2:平台配送,3:自提
      receiverName: defaultAddress.user_name,
      receiverPhone:defaultAddress.mobile,
      delivererAddress:defaultAddress.address_name + defaultAddress.addressDetail,
      coordinateType:1,
      longitude:defaultAddress.longitude,
      latitude:defaultAddress.latitude
    }
    let payment = {
      memberId:wx.getStorageSync('customerId'),
      memberPassword:"",
      totalFee:this.data.totalPrice * 100,//订单总价，订单总价=商品总金额+餐盒费+配送费，单位：分
      deliveryFee:10000,//配送费
      packageFee:500,//餐盒费
      discountFee:0 ,
      platformDiscountFee:0,
      shopDiscountFee:0,
      shopFee:this.data.totalPrice * 100,//商户实收总价
      userFee:this.data.totalPrice * 100,//用户实付总价
      serviceFee:0,
      subsidies:0,
      payType:2,
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
          isPrint:1
        },
        method: "POST",
        success(result) {
          console.log(result)
        }
      })
    })
  }
})