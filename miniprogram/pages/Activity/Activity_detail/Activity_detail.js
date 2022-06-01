const db = wx.cloud.database()
const act = db.collection('activity')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item_act: {}

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('id', );
    // console.log(options.id)


    act.where({
      _id: options.id
    }).get().then(res => {
      // console.log('res',res)

      let item_act = res.data[0]
      item_act.time = this.secondsToDate(item_act.time)
      if(item_act.in_campus == '校内') item_act.in_campus = '是'
      else item_act.in_campus = '否'
      this.setData({
        item_act: item_act,
      })
      console.log('item_act', item_act);

    }).catch(err => {
      console.log('查询失败', err)
    })

  },

  secondsToDate(seconds) {
    //不显示秒 + 时间补0
    var date = new Date(seconds)
    date.setSeconds(0)
    var DateTime =
      date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    let H =
      date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':'
    let M = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    let tim = DateTime + ' ' + H + M
    return tim
  },
  secondsToDates: function (res) {
    for (const v of res) {
      let time = this.secondsToDate(v.time)
      v.time = time
    }
    return res
  },
  //图片放大
  preview_picture(event) {
    console.log(event)
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})