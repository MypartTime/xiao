//index.js
const app = getApp()

Page({
  data: {
    dishList: [], //菜品列表
    showHeader: false,
    navList: [],
    active: 0,
    totalNum: 0,
    totalPrice: 0,
    shopCarDishList: {}, //购物车里的商品
    showShopCar: false, //是否显示购物车
    tapClose: true,

  },
  onLoad() {
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
        dataType: 'text',
        data: {
          dishTypeId: id
        },
        success(result) {
          wx.hideLoading()
          let data = app.getRealJsonData(result.data)
          if (data.code == 0) {
            that.setData({
              dishList: data.result.dishList
            })
            that.getShopCarGoods()
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
        dataType: 'text',
        success(result) {
          wx.hideLoading()
          let data = app.getRealJsonData(result.data)
          if (data.code == 0) {
            let navList = []
            data.result.forEach(el => {
              if (el.name == '主菜' || el.name == '小吃') {
                navList.push(el)
              }
            });

            that.setData({
              navList: navList
            }, () => {
              that.getDishList(navList[0].id)
            })
          }
        }
      })
    })

  },
  //获取数据库中的购物车列表
  getShopCarGoods() {
    const that = this
    const db = wx.cloud.database()
    db.collection('customer_shopcar').where({
        user_id: wx.getStorageSync('customerId')
      })
      .get({
        success: function (res) {
          if (res.data.length == 0) {} else {
            let totalNum = 0,
              totalPrice = 0
            let list = that.data.dishList
            list.forEach(el => {
              if (el.totalNum) {
                el.totalNum = null
              }
            })
            list.forEach(el => {
              res.data[0].data.forEach(e => {
                if (el.brandDishId == e.id) {
                  el.totalNum = e.totalNum
                }
              })
            })
            res.data[0].data.forEach(e => {
              totalNum += parseInt(e.totalNum)
              totalPrice += e.totalNum * e.price
            })
            that.setData({
              dishList: list,
              totalNum,
              totalPrice:totalPrice.toFixed(2),
              shopCarDishList: res.data[0]
            })
          }
        }
      })
  },
  //商品列表操纵购物车
  handleCarDish(e) {
    const that = this
    let i = e.currentTarget.dataset.i
    let item = e.currentTarget.dataset.item
    let index = e.currentTarget.dataset.index
    let shopcarlist = this.data.shopCarDishList
    let dishList = this.data.dishList
    const db = wx.cloud.database()
    if (i == 1) {
      if (!shopcarlist.data) {
        let list = [{
          id: item.brandDishId,
          name: item.name,
          price: item.marketPrice,
          dishPropertyTypeInfos: item.dishPropertyTypeInfos,
          dishImgUrl: item.smallImgUrls[0],
          totalNum: 1
        }]
        db.collection('customer_shopcar').add({
          data: {
            user_id: wx.getStorageSync('customerId'),
            data: list
          }
        }).then(res => {
          this.getShopCarGoods()
        })
        dishList.forEach(el => {
          if (el.brandDishId == item.brandDishId) {
            el.totalNum = 1
          }
        })
        this.setData({
          dishList
        })
      } else {
        if (item.totalNum) {
          shopcarlist.data.forEach(el => {
            if (el.id == item.brandDishId) {
              el.totalNum++
            }
          })
        } else {
          shopcarlist.data.push({
            id: item.brandDishId,
            name: item.name,
            price: item.marketPrice,
            dishPropertyTypeInfos: item.dishPropertyTypeInfos,
            dishImgUrl: item.smallImgUrls[0],
            totalNum: 1
          })
        }
        db.collection("customer_shopcar").doc(shopcarlist._id).update({
          data: {
            data: shopcarlist.data
          },
          success: function (res) {
            that.getShopCarGoods()
          }
        })
      }
    } else {
      if (item.totalNum == 1) {
        shopcarlist.data.forEach((el, i) => {
          if (el.id == item.brandDishId) {
            shopcarlist.data.splice(i, 1)
          }
        })
      } else {
        shopcarlist.data.forEach(el => {
          if (el.id == item.brandDishId) {
            el.totalNum--
          }
        })
      }
      db.collection("customer_shopcar").doc(shopcarlist._id).update({
        data: {
          data: shopcarlist.data
        },
        success: function (res) {
          that.getShopCarGoods()
        }
      })
    }
  },
  //购物车列表操作购物车
  handleShopCar(e) {
    let item = e.currentTarget.dataset.item
    let i = e.currentTarget.dataset.i
    let shopCarList = this.data.shopCarDishList
    const that = this
    const db = wx.cloud.database()
    if (i == 1) {
      shopCarList.data.forEach(el => {
        if (el.id == item.id) {
          el.totalNum++
        }
      })
    } else if (i == -1 && item.totalNum == 1) {
      shopCarList.data.forEach((el, i) => {
        if (el.id == item.id) {
          shopCarList.data.splice(i, 1)
        }
      })
    } else if (i == -1 && item.totalNum != 1) {
      shopCarList.data.forEach((el, i) => {
        if (el.id == item.id) {
          el.totalNum--
        }
      })
    }
    db.collection("customer_shopcar").doc(shopCarList._id).update({
      data: {
        data: shopCarList.data
      },
      success: function (res) {
        that.getShopCarGoods()
      }
    })
  },
  onClose() {
    this.setData({
      showShopCar: false
    })
  },
  handleShowShopCar() {
    let bool = this.data.showShopCar
    if (this.data.shopCarDishList.data.length != 0) {
      this.setData({
        showShopCar: !bool
      })
    }
  },
})