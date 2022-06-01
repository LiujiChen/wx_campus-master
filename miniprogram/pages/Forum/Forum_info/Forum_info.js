const db = wx.cloud.database()
const _ = db.command
const forum = db.collection('forum')
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    value: '',
    list: [],
    //排序关键字
    orderByTime: true,
    orderByValue: false,
  },

  onLoad() {
    this.getSearchRes('')
    // 加载提示
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
      mask: true
    })
  },
  // 主要查询
  async getSearchRes(key) {
    const MAX_LIMIT = 20
    const countResult = await forum
      .where(
        _.or([
          {
            title: db.RegExp({
              regexp: '.*' + key,
              options: 'i',
            }),
          },
          {
            tag: db.RegExp({
              regexp: '.*' + key,
              options: 'i',
            }),
          },
          {
            user_name: db.RegExp({
              regexp: '.*' + key,
              options: 'i',
            }),
          },
        ])
      ).count()
    // console.log('countResult', countResult)
    const total = countResult.total
    const batchTimes = Math.ceil(total / MAX_LIMIT)

    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = forum
        .where(
          _.or([
            {
              title: db.RegExp({
                regexp: '.*' + key,
                options: 'i',
              }),
            },
            {
              tag: db.RegExp({
                regexp: '.*' + key,
                options: 'i',
              }),
            },
            {
              user_name: db.RegExp({
                regexp: '.*' + key,
                options: 'i',
              }),
            },
          ])
        )
        .skip(i * MAX_LIMIT)
        .get()
      tasks.push(promise)
    }
    // console.log(tasks)
    console.log(await Promise.all(tasks))

    let list = []
    for (let i of await Promise.all(tasks)) {
      for (let j of i.data) list.push(j)
    }
    this.setData({
      list: this.secondsToDates(list)
    })

    // 排序
    if (this.data.orderByValue) {
      this.sortByValue()
    }
    if (this.sortByTime) {
      this.sortByTime()
    }
  },
  onChange(e) {
    this.setData({
      value: e.detail,
    })
  },
  onSearch() {
    wx.showToast({
      title: '搜索:' + this.data.value,
    })
    this.getSearchRes(this.data.value)
  },
  onClear() {
    this.getSearchRes('')
  },
  // 按照时间排序
  sortByTime: function () {
    let cplist = this.data.list.sort(function (a, b) {
      return b.time_publish - a.time_publish
    })
    this.setData({
      orderByTime: true,
      orderByValue: false,
      list: cplist,
    })
  },
  // 按照价值排序
  sortByValue: function () {
    let cplist = this.data.list.sort(function (a, b) {
      return b.likes - b.dislikes - (a.likes - a.dislikes)
    })
    // console.log('价值排序',cplist)
    this.setData({
      orderByTime: false,
      orderByValue: true,
      list: cplist,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getSearchRes('')
  },
  // 跳转主页
  onUnload: function () {
    //跳转指定页
    wx.reLaunch({
      url: '../../index/index'
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    Toast.clear('clearAll')
  },

  // 处理日期函数
  secondsToDate: function (seconds) {
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
  //批量处理日期
  secondsToDates: function (res) {
    for (const v of res) {
      let time = this.secondsToDate(v.time_publish)
      v.time_publish_string = time
      let seconds = new Date(v.time_publish).getTime()
      v.time_publish = seconds
      // console.log(v.time_publish_string)
    }
    return res
  },
  // handleSearchRes(res) {
  //   console.log('处理结果', res)
  //   if (res.data.length !== 0) {
  //     this.setData({
  //       list: res.data,
  //     })
  //   } else {
  //     this.setData({
  //       list: [],
  //     })
  //   }
  // },

})
