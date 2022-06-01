// FIX 目前的默认状态是: 所有状态, 以后默认为:未找到
const db = wx.cloud.database()
const lost = db.collection('item_lost')
const _ = db.command
import Toast from '@vant/weapp/toast/toast';
Page({
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData(),
      this.setData({
        value1: 'a0', value2: 'b0', value3: 'c0', value4: 'd0',
      })
  },

  // 处理日期函数
  secondsToDate: function (seconds) {
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
      let time = this.secondsToDate(v.time_found)
      v.time_found = time
    }
    return res
  },
  // 跳转主页
  onUnload: function () {
    //跳转指定页
    wx.reLaunch({
      url: '../../index/index'
    })
  },
  //图片放大
  preview_picture(event) {
    console.log(event)
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })
  },

  /* getData: 进行全量查询 */
  getData: function () {
    wx.cloud
      .callFunction({
        name: 'GetAllResult',
        data: {
          table_name: 'item_lost',
        },
      })
      .then((res) => {
        res.result.data.sort(function (a, b) {
          return b.time_found - a.time_found
        })
        this.setData({
          item_records: this.secondsToDates(res.result.data),
        })
        console.log('', this.data.item_records)
      })
      .catch((err) => { })
  },
  /* 加载时自动请求数据 */
  onLoad: function (options) {
    this.getData()
    // 加载提示
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
      mask: true,
    })
  },
  data: {
    // 是否显示遮罩层
    is_ready: false,
    item_records: [],
    map: {
      a1: '电子设备', a2: '证件', a3: '雨伞和水杯', a4: '衣物', a5: '文具', a6: '书籍', a7: '日用品', a8: '其他',
      b1: '第一教学楼', b2: '综合楼', b3: '艺术楼', b4: '第一实验楼', b5: '第二实验楼', b6: '图书馆', b7: '一食堂和四食堂', b8: '二食堂', b9: '三食堂', b10: '学生活动中心', b11: '小剧场', b12: '大剧场', b13: '松园体育场', b14: '梅园体育场', b15: '校车站', b16: '其他地点',
      c1: 86400000, c2: 259200000, c3: 604800000, c4: '更长时间',
      d1: true,
      d2: false,
    },
    option1: [
      { text: '全部类型', value: 'a0', },
      { text: '电子设备', value: 'a1', },
      { text: '证件', value: 'a2', },
      { text: '雨伞和水杯', value: 'a3', },
      { text: '衣物', value: 'a4', },
      { text: '文具', value: 'a5', },
      { text: '书籍', value: 'a6', },
      { text: '日用品', value: 'a7', },
      { text: '其他', value: 'a8', },
    ],
    option2: [
      { text: '全部地点', value: 'b0', },
      { text: '第一教学楼', value: 'b1', },
      { text: '综合楼', value: 'b2', },
      { text: '艺术楼', value: 'b3', },
      { text: '第一实验楼', value: 'b4', },
      { text: '第二实验楼', value: 'b5', },
      { text: '图书馆', value: 'b6', },
      { text: '一食堂和四食堂', value: 'b7', },
      { text: '二食堂', value: 'b8', },
      { text: '三食堂', value: 'b9', },
      { text: '学生活动中心', value: 'b10', },
      { text: '小剧场', value: 'b11', },
      { text: '大剧场', value: 'b12', },
      { text: '松园体育场', value: 'b13', },
      { text: '梅园体育场', value: 'b14', },
      { text: '校车站', value: 'b15', },
      { text: '其他地点', value: 'b16', },
    ],
    option3: [
      { text: '全部时间', value: 'c0', },
      { text: '一天内', value: 'c1', },
      { text: '三天内', value: 'c2', },
      { text: '一周内', value: 'c3', },
      { text: '更长时间', value: 'c4', },
    ],
    option4: [
      { text: '全部状态', value: 'd0', },
      { text: '已领取', value: 'd1', },
      { text: '未领取', value: 'd2', },
    ],
    // 默认值
    value1: 'a0',
    value2: 'b0',
    value3: 'c0',
    value4: 'd0',
    status_flags: [false, false, false, false],
  },

  // 当关闭标签选择的时候的事件
  async closed({ detail }) {
    // 判断修改了什么筛选条件
    let c = detail[0]
    if (c == 'a') {
      // 类型 == type
      // 修改value
      this.setData({
        value1: detail,
      })
      // 修改是否change
      if (detail == 'a0') {
        this.data.status_flags[0] = false
      } else {
        this.data.status_flags[0] = true
      }
    } else if (c == 'b') {
      // 地点 == location
      this.setData({
        value2: detail,
      })
      if (detail == 'b0') {
        this.data.status_flags[1] = false
      } else {
        this.data.status_flags[1] = true
      }
    } else if (c == 'c') {
      // 找到时间 == time_found
      this.setData({
        value3: detail,
      })
      if (detail == 'c0') {
        this.data.status_flags[2] = false
      } else {
        this.data.status_flags[2] = true
      }
    } else {
      // 状态 == status
      this.setData({
        value4: detail,
      })
      if (detail == 'd0') {
        this.data.status_flags[3] = false
      } else {
        this.data.status_flags[3] = true
      }
    }

    /* 对相关变量进行赋值操作 */
    let type_val =
      this.data.status_flags[0] === false
        ? undefined
        : this.data.map[this.data.value1]
    let location_val =
      this.data.status_flags[1] === false
        ? undefined
        : this.data.map[this.data.value2]
    let is_found_val =
      this.data.status_flags[3] === false
        ? undefined
        : this.data.map[this.data.value4]

    let now = Date.parse(new Date())
    let delta_time = this.data.map[this.data.value3]
    let time_lower =
      this.data.map[this.data.value3] === '更长时间' ? 0 : now - delta_time
    let time_upper =
      this.data.map[this.data.value3] === '更长时间' ? now - 604800000 : now
    if (this.data.value3 === 'c0') {
      time_lower = 0
      time_upper = now
    }

    const MAX_LIMIT = 20
    // 先取出集合记录总数
    const countResult = await db
      .collection('item_lost')
      .where({
        type: type_val,
        location: location_val,
        is_found: is_found_val,
        time_found: _.gte(time_lower).and(_.lt(time_upper)),
      })
      .count()
    // console.log(table_name,type,location,is_found,time_lower,time_upper)
    // console.log(countResult)
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      //get()操作返回的是Promise对象，每获取一个Promise就压栈进入tasks数组
      const promise = db
        .collection('item_lost')
        .where({
          type: type_val,
          location: location_val,
          is_found: is_found_val,
          time_found: _.gte(time_lower).and(_.lt(time_upper)),
        })
        .skip(i * MAX_LIMIT)
        .get()
      tasks.push(promise)
    }
    // console.log(tasks)
    // console.log(await Promise.all(tasks))
    // 等待所有
    /* Promise.all 方法用于将多个 Promise 实例，包装成一个新的 Promise 实例
     在任何情况下，Promise.all 返回的 promise 的完成状态的结果都是一个数组。
     在这里，返回的数组的元素就是res.data
     数组reduce操作：array.reduce(function(total, currentValue, currentIndex, arr), initialValue)
     total  必需。初始值, 或者计算结束后的返回值。
     currentValue  必需。当前元素
     currentIndex  可选。当前元素的索引
     arr  可选。当前元素所属的数组对象。
     initialValue  可选。传递给函数的初始值
     **此处acc为初始值，cur为当前元素
     concat() 方法用于连接两个或多个数组
    */
    // console.log(await Promise.all(tasks))

    let res = []
    for (let i of await Promise.all(tasks)) {
      for (let j of i.data) res.push(j)
    }

    // 按照时间排序
    res.sort(function (a, b) {
      return b.time_found - a.time_found
    })
    console.log(res)
    this.setData({
      item_records: this.secondsToDates(res),
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    Toast.clear('clearAll')
  },

})
