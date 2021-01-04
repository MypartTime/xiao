//index.js
const app = getApp()

Page({
  data: {
    dishList:[],
    startId:''
  },
  onLoad(){
    this.getDishList()
  },
  handlePayment() {
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
  onReachBottom(){
    if(this.data.startId){
      this.getDishList()
    }
  },
  getDishList(){
    wx.showLoading({title:"加载中"})
    const that = this
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/cater/dish/dishMenu' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        method:"POST",
        data:{
          shopIdenty:"810983262",
          pageNum:"10",
          startId:that.data.startId
        },
        success(result){
          wx.hideLoading()
          console.log(result)

          if(result.data.code == 0){
            let list = that.data.dishList
            if(that.data.startId){
              list.push(...result.data.result.dishTOList)
              that.setData({
                dishList:list,
                startId:result.data.result.startId
              })
            }else{
              that.setData({
                dishList:result.data.result.dishTOList,
                startId:result.data.result.startId
              })
            }
          }
        }
      })
    })
  },
  
})