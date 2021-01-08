const app = getApp()
var md5 = require('md5');
Page({
  data: {
    userInfo: {},
    account: '', //输入的价格
    dicountPirce: '', //会员折扣部分的价格
    reallyPrice: '0', //真实支付的价格
    vipAccount: '', //会员储值金额
    deductAccount: '', //会员抵扣的金额
    level: '',
    show: false,//页面展示
    showLog: false,//登录显示
    showPwd: false,//密码框展示
    showMethods:false,//弹出支付方式
    tapClose:true
  },
  onShow() {
    if (wx.getStorageSync('mobile') && wx.getStorageSync('customerId')) {
      this.getUserInfo()
      this.setData({
        showLog: false
      })
    } else {
      this.setData({
        showLog: true
      })
    }
  },
  //控制输入金额
  handleInput(e) {
    //总价
    let account = e.detail.value
    //实际价格
    let reallyPrice = ''
    //会员抵扣的金额
    let deductAccount = ''
    //会员折扣部分价格
    let dicountPirce = (account * 0.12).toFixed(2)
    if (this.data.level) {
      reallyPrice = (account * 0.88).toFixed(2)
      if (reallyPrice < this.data.vipAccount) {
        deductAccount = reallyPrice
        reallyPrice = 0
      } else {
        deductAccount = this.data.vipAccount
        reallyPrice = (reallyPrice - this.data.vipAccount).toFixed(2)
      }
    } else {
      reallyPrice = account
    }
    this.setData({
      account,
      dicountPirce,
      reallyPrice,
      deductAccount
    })
  },
  //关闭支付
  handlePwd() {
    this.setData({
      showPwd: false
    })
  },
  //点击支付
  handlePay() {
    if (this.data.account * 1 != 0) {
      this.setData({
        showMethods:true
      })
    } else {
      app.showToast('请输入买单金额', 'error')
    }
  },
  inputPwd(e) {
    let pwd = e.detail.value
    console.log(pwd)
    if (pwd.length == 6 && pwd != this.data.userInfo.memo) {
      app.showToast('密码错误,请重试', 'none')
    } else if (pwd.length == 6 && pwd == this.data.userInfo.memo) {
      console.log('支付成功')
      console.log('调用接口扣除储值金额及生成订单')
    }
  },
  getUserInfo() {
    const that = this
    app.showLoading('加载中')
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
          app.hideLoading()
          // result.data.result.level = null
          if (result.data.code == 0) {
            that.setData({
              userInfo: result.data.result,
              show: true,
              vipAccount: result.data.result.remainValue,
              level: result.data.result.level
            })
          } else {
            wx.showModal({
              title: '提示',
              content: result.data.message,
              showCancel: false
            })
          }
        }
      })
    })
  },
  onClose(){
    this.setData({
      showMethods:false
    })
  },
  handleGoodsOrder(type) {
    const that = this
    let data = {}
    let deductAccount = (this.data.deductAccount * 100).toFixed(0) * 1
    if (type == 1) {
      //会员余额足够支付
      data = {
        tpOrderId: 'XIAO' + Date.parse(new Date()) / 1000 + parseInt((Math.random() * 9) + 1), //订单号
        createTime: new Date().getTime(), //创建时间
        updateTime: new Date().getTime(), //更新时间
        shopIdenty: app.shopIdenty, //店铺id
        shopName: app.shopName, //店铺名
        peopleCount: 1, //就餐人数
        totalPrice: deductAccount, //总价
        status: 2, //订单状态
        remark: '会员余额足够支付',
        products: [{
          tpId: '443821176247062500', //菜品id
          type: 0, //菜品类型
          name: '微信小程序支付',
          unit: '斤',
          price: deductAccount, //菜品价格
          quantity: 1, //菜品份数
          totalFee: this.data.account * 100, //菜品总价
        }], //菜品信息
        payment: {
          memberId: wx.getStorageSync('customerId'), //会员id
          memberPassword: md5(this.data.userInfo.memo), //会员支付密码
          totalDiscountFee: this.data.dicountPirce * 100, //优惠总金额 优惠总金额=平台优惠总金额+商家优惠总金额,单位：分
          totalFee: this.data.account * 100, //订单总价=商品总额,单位是分，单位：分
          platformDiscountFee: 0, //平台优惠总金额，单位：分
          shopDiscountFee: this.data.dicountPirce * 100, //商家优惠
          serviceFee: 0, //服务费
          userFee: deductAccount, //用户实付总价
          shopFee: deductAccount, //商户实收总价
          payType: 1
        }
      }
    } else if(type == 2){
      data = {
        tpOrderId: 'XIAO' + Date.parse(new Date()) / 1000 + parseInt((Math.random() * 9) + 1), //订单号
        createTime: new Date().getTime(), //创建时间
        updateTime: new Date().getTime(), //更新时间
        shopIdenty: app.shopIdenty, //店铺id
        shopName: app.shopName, //店铺名
        peopleCount: 1, //就餐人数
        totalPrice: deductAccount, //总价
        status: 2, //订单状态
        remark: `会员余额不足以支付商品，余额支付${this.data.deductAccount}元，用户微信支付${this.data.reallyPrice}元`,
        products: [{
          tpId: '443821176247062500', //菜品id
          type: 0, //菜品类型
          name: '微信小程序支付',
          unit: '斤',
          price: this.data.account * 100, //菜品价格
          quantity: 1, //菜品份数
          totalFee: this.data.account * 100, //菜品总价
        }], //菜品信息
        payment: {
          memberId: wx.getStorageSync('customerId'), //会员id
          memberPassword: md5(this.data.userInfo.memo), //会员支付密码
          totalDiscountFee: this.data.dicountPirce * 100 + this.data.reallyPrice * 100, //优惠总金额 优惠总金额=平台优惠总金额+商家优惠总金额,单位：分
          totalFee: this.data.account * 100, //订单总价=商品总额,单位是分，单位：分
          platformDiscountFee: 0, //平台优惠总金额，单位：分
          shopDiscountFee: this.data.dicountPirce * 100 + + this.data.reallyPrice * 100, //商家优惠
          serviceFee: 0, //服务费
          userFee: deductAccount, //用户实付总价
          shopFee: ((this.data.deductAccount * 1 + this.data.reallyPrice * 1) * 100).toFixed(0) * 1, //商户实收总价
          payType: 1
        }
      }
    }else{
      data = {
        tpOrderId: 'XIAO' + Date.parse(new Date()) / 1000 + parseInt((Math.random() * 9) + 1), //订单号
        createTime: new Date().getTime(), //创建时间
        updateTime: new Date().getTime(), //更新时间
        shopIdenty: app.shopIdenty, //店铺id
        shopName: app.shopName, //店铺名
        peopleCount: 1, //就餐人数
        totalPrice: deductAccount, //总价
        status: 2, //订单状态
        remark: `微信支付${this.data.account}元`,
        products: [{
          tpId: '443821176247062500', //菜品id
          type: 0, //菜品类型
          name: '微信小程序支付',
          unit: '斤',
          price: this.data.account * 100, //菜品价格
          quantity: 1, //菜品份数
          totalFee: this.data.account * 100, //菜品总价
        }], //菜品信息
        payment: {
          memberId: wx.getStorageSync('customerId'), //会员id
          memberPassword: md5(this.data.userInfo.memo), //会员支付密码
          totalDiscountFee: this.data.dicountPirce * 100 + this.data.reallyPrice * 100, //优惠总金额 优惠总金额=平台优惠总金额+商家优惠总金额,单位：分
          totalFee: this.data.account * 100, //订单总价=商品总额,单位是分，单位：分
          platformDiscountFee: 0, //平台优惠总金额，单位：分
          shopDiscountFee: this.data.dicountPirce * 100 + + this.data.reallyPrice * 100, //商家优惠
          serviceFee: 0, //服务费
          userFee: deductAccount, //用户实付总价
          shopFee: ((this.data.deductAccount * 1 + this.data.reallyPrice * 1) * 100).toFixed(0) * 1, //商户实收总价
          payType: 1
        }
      }
    }
    console.log(data)
    // return 
    app.getSign().then(result => {
      wx.request({
        url: app.baseUrl + '/open/v1/snack/order/create' + app.getPublicKeys(result.result.timestamp) + `&sign=${result.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        method: "POST",
        data,
        success(result) {
          console.log(result)
        }
      })
    })
  }
})