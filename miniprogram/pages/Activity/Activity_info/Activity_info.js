const db = wx.cloud.database()
const activity = db.collection('activity')
const _ = db.command
Page({
  onUnload(){wx.reLaunch({
    url: '../../index/index',
  })},
  /**
   * 页面的初始数据
   */
  data: {
    delta_time_map: {
      '今天': 86400000,
      '三天内': 259200000,
      '一周内': 604800000,
      '更多': '更多'
    },
    curr_type: '全部类型',
    curr_time: '全部时间',
    curr_in_campus: '全部地点',
    show_type: false,
    show_time: false,
    show_in_campus: false,
    type_list: [
      { name: '全部类型' },
      { name: '志愿者招募', subname: '各大社团或校团委组织的志愿活动' },
      { name: '比赛与选拔' },
      { name: '娱乐活动' },
      { name: '其他' }
    ],
    time_list: [
      { name: '全部时间', subname: '这里的时间是指活动（报名）截止时间' },
      { name: '今天' },
      { name: '三天内' },
      { name: '一周内' },
      { name: '更多' },
    ],
    in_campus_list: [
      { name: '全部地点' },
      { name: '校内', subname: '可能会在不同的校区，请仔细参阅活动详情' },
      { name: '校外' },
      { name: '其他' },
    ],
    item_list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData()
  },
  async getData() {
    let type = this.data.curr_type == '全部类型' ? undefined : this.data.curr_type
    let in_campus = this.data.curr_in_campus == '全部地点' ? undefined : this.data.curr_in_campus

    // TODO 处理时间

    console.log('type', type)
    console.log('in_campus', in_campus)

    let now = Date.parse(new Date())
    let delta_time = this.data.delta_time_map[this.data.curr_time]
    let time_lower =
      this.data.delta_time_map[this.data.curr_time] === '更多' ? 0 : now - delta_time
    let time_upper =
      this.data.delta_time_map[this.data.curr_time] === '更多' ? now - 604800000 : now

    // 全部时间
    if (this.data.curr_time === '全部时间') {
      time_lower = 0
      time_upper = now
    }

    const MAX_LIMIT = 20
    const countResult = await activity
      .where({
        type: type,
        in_campus: in_campus,
        time: _.gte(time_lower).and(_.lt(time_upper)),
      })
      .count()

    const total = countResult.total
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = activity.where({
        type: type,
        in_campus: in_campus,
        time: _.gte(time_lower).and(_.lt(time_upper)),
      })
        .skip(i * MAX_LIMIT)
        .get()
      tasks.push(promise)
    }

    let res = []
    for (let i of await Promise.all(tasks)) {
      for (let j of i.data) res.push(j)
    }

    this.setData({
      item_list: this.secondsToDates(res)
    })

    console.log('item_list', this.data.item_list);
  },
  //不显示秒 + 时间补0
  secondsToDate(seconds) {
    var date = new Date(seconds)
    date.setSeconds(0)
    var DateTime =
      date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    let H =
      date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':'
    let M = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    let tim = DateTime + ' ' + H + M
    return DateTime
  },
  secondsToDates: function (res) {
    for (const v of res) {
      let time = this.secondsToDate(v.time)
      v.time = time
    }
    return res
  },
  showType() {
    this.setData({
      show_type: true,
    })
  },
  closeType() {
    this.setData({
      show_type: false,
    })
    this.getData()
  },
  selectType(event) {
    this.setData({
      curr_type: event.detail.name,
    })
  },

  showTime() {
    this.setData({
      show_time: true,
    })
  },

  closeTime() {
    this.setData({
      show_time: false,
    })
    this.getData()
  },

  selectTime(event) {
    this.setData({
      curr_time: event.detail.name,
    })

  },

  showIn_campus() {
    this.setData({
      show_in_campus: true,
    })
  },

  closeIn_campus() {
    this.setData({
      show_in_campus: false,
    })
    this.getData()
  },

  selectIn_campus(event) {
    this.setData({
      curr_in_campus: event.detail.name,
    })
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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

  },



})