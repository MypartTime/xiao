//index.js
const app = getApp()

Page({
  data: {
    dishList: [],
    showHeader: false,
    navList: [],
    active: 0
  },
  onLoad() {
    // this.getDishList()
    this.getDishCategory()
    let position = wx.getMenuButtonBoundingClientRect()
    this.setData({
      top: position.top
    })
  },
  handleNav(e) {
    let i = e.currentTarget.dataset.i
    this.setData({
      active: i
    }, () => {
      this.getDishList(this.data.navList[i].id)
    })
  },
  onReachBottom() {
    if (this.data.startId) {
      this.getDishList()
    }
  },
  onPageScroll(e) {
    if (e.scrollTop > 200) {
      this.setData({
        showHeader: true
      })
    } else {
      this.setData({
        showHeader: false
      })

    }
  },
  //获取菜单
  getDishList(id) {
    wx.showLoading({
      title: "加载中"
    })
    const that = this
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/cater/dish/dishNew' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        method: "POST",
        data: {
          dishTypeId: id
        },
        success(result) {
          wx.hideLoading()
          console.log(result)
          if(result.data.code == 0){
            that.setData({
              dishList:result.data.result.dishList
            })
          }
        }
      })
    })
  },
  //菜单分类
  getDishCategory() {
    const that = this
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/cater/dish/category' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        method: "POST",
        dataType:'text',
        success(result) {
          wx.hideLoading()
          let data = app.getRealJsonData(result.data)
          if (data.code == 0) {
            that.setData({
              navList: data.result
            }, () => {
              that.getDishList(data.result[0].id)
            })
          }
        }
      })
    })

  },

})