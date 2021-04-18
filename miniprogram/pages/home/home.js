const app = getApp()
Page({
  data: {
    navList:[
      {
        title:'会员',
        imgUrl:'/images/home-vip.png'
      },
      {
        title:'买单',
        imgUrl:'/images/home-Dormitudinal.png'
      },
      {
        title:'外卖',
        imgUrl:'/images/home-takeAway.png'
      },
      {
        title:'订单',
        imgUrl:'/images/home-orders.png'
      },
    ]
  },
  handleNav(e){
    let title = e.currentTarget.dataset.title
    if(wx.getStorageSync('mobile')){
      switch(title){
        case '会员':
          wx.navigateTo({
            url: '/pages/recharge/recharge',
          })
          break;
        case '买单':
          wx.switchTab({
            url: '/pages/pay/pay',
          })
          break;
        case '外卖':
          wx.navigateTo({
            url: '/pages/index/index',
          })
          break;
        case '订单':
          wx.switchTab({
            url: '/pages/order/order',
          })
          break;
      }
    }else{
      app.navigator('/pages/login/login')
    }
  }

})