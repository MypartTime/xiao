Page({

  data: {
    mobile:wx.getStorageSync('mobile'),
    avatar:wx.getStorageSync('avatar'),
    name:wx.getStorageSync('name'),
  },

  onLoad: function (options) {

  },
})