// pages/Post/Post.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    Index_active: false,
    Post_active: true,
    Person_active: false,

    active_index: '../icons/active_home.png',
    inactive_index: '../icons/inactive_home.png',
    active_post: "../icons/active_post.png",
    inactive_post: "../icons/inactive_post.png",
    active_people: "../icons/active_people.png",
    inactive_people: "../icons/inactive_people.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { },

  goIndex() {
    wx.redirectTo({
      url: '../index/index',
    }),
      this.setData({
        Index_active: true,
        Post_active: false,
        Person_active: false,
      })
  },

  goPost() {
    wx.redirectTo({
      url: '../Post/Post',
    }),
      this.setData({
        Index_active: false,
        Post_active: true,
        Person_active: false,
      })
  },

  goPerson() {
    wx.reLaunch({
      url: '../person/person',
    }),
      this.setData({
        Index_active: false,
        Post_active: false,
        Person_active: true,
      })
  },

})
