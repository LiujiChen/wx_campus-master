const db = wx.cloud.database()
const deal = db.collection('Deal')
import Toast from '@vant/weapp/toast/toast';
Page({
  // 页面加载
  onLoad() {
    this.getData()
    // 加载提示
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
      mask: true,
    })
  },
  // 跳转主页
  onUnload: function () {
    //跳转指定页
    wx.reLaunch({
      url: '../../index/index'
    })
  },
  data: {
    type_show: false,
    zone_show: false,
    currtype: '全部类型',
    currzone: '全部校区',
    type_list: [
      { name: '全部类型', value: 't0', },
      { name: '自行车', value: 't1', },
      { name: '数码设备', subname: '电子产品', value: 't2', },
      {
        name: '数码外设', subname: '键盘、鼠标或支架等', value: 't3',
        //subname: '描述信息',
        //openType: 'share',
      },
      { name: '会员卡', value: 't4', },
      { name: '门票', subname: '电影票、演出和赛事门票', },
      { name: '其他', },
    ],
    zone_list: [
      { name: '全部校区', value: 'o0', },
      { name: '重大A区', value: 'o1', },
      { name: '重大B区', value: 'o2', },
      { name: '重大C区', value: 'o3', },
      { name: '重大D区', subname: '虎溪校区', value: 'o4', },
    ],
    item_list: []
  },
  // 请求数据函数(全量)
  async getData() {
    let zone_val = this.data.currzone === '全部校区' ? undefined : this.data.currzone
    let type_val = this.data.currtype === '全部类型' ? undefined : this.data.currtype
    // console.log('zone_val', zone_val)
    // console.log('type_val', type_val)
    // batchsize
    const MAX_LIMIT = 20
    // 查询记录总数
    const countResult = await deal.where({
      type: type_val,
      zone: zone_val
    })
      .count()
    // console.log(table_name,type,location,is_found,time_lower,time_upper)
    // console.log(countResult)

    // 计算相关参数
    const total = countResult.total
    const batchTimes = Math.ceil(total / MAX_LIMIT)

    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = deal.where({
        type: type_val,
        zone: zone_val
      })
        .skip(i * MAX_LIMIT)
        .get()
      tasks.push(promise)
      // console.log(promise)
    }
    // console.log(tasks)
    // console.log(await Promise.all(tasks))

    let res = []
    for (let i of await Promise.all(tasks)) {
      for (let j of i.data) res.push(j)
    }
    // 按照时间排序
    res.sort(function (a, b) {
      return b.time_found - a.time_found
    })
    console.log('时间排序后', res)

    // 设置页面渲染的数据
    this.setData({
      item_list: res,
    })
  },

  // 选择type(3个)
  showType() {
    this.setData({
      type_show: true,
    })
  },
  type_onClose() {
    this.setData({
      type_show: false,
    })
    this.getData()
  },
  selectType(e) {
    this.setData({
      currtype: e.detail.name,
    })
  },
  // 选择zone(3个)
  showzone() {
    this.setData({
      zone_show: true,
    })
  },
  zone_onClose() {
    this.setData({
      zone_show: false,
    })
    this.getData()
  },
  selectZone(e) {
    this.setData({
      currzone: e.detail.name,
    })
  },

  onSelect(event) {
    this.setData({
      currtype: event.detail.name,
    })
    // console.log(event.detail)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    Toast.clear('clearAll')
  },
})
