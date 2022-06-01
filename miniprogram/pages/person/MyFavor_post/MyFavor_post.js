// pages/MyFavor_post/MyFavor_post.js
const db = wx.cloud.database()
const find = db.collection('item_lost')
const forum = db.collection("forum")
const deal = db.collection('Deal')
const favorite = db.collection('favorite')
const _ = db.command
import Toast from '@vant/weapp/toast/toast';

Page({
  // 取消领取
  cancelFindCollection(e) {
    // 1. 只会修改favorite表
    // 2. 还要修改那个本表
    // 如何获取Id?
    // console.log('e=', e);
    let id = e.currentTarget.dataset.id
    let index = e.currentTarget.dataset.index
    console.log('index', index)
    console.log('e=', e);
    console.log('find_rec_item[index]', this.data.find_rec_item[index])


    console.log('openid', this.data.open_id);

    // 数据库操作
    favorite.where({
      open_id: this.data.open_id
    }).get().then(res => {
      console.log('成功查询', res)
      let obj = res.data[0].find_favor
      // console.log('find_favor', obj)
      obj[id] = false
      // console.log('find_favor', obj)

      // 写回favorite
      favorite.where({
        open_id: this.data.open_id
      }).update({
        data: {
          find_favor: obj
        }
      }).then(res => {
        console.log('成功协会', res)
      })
        .catch(err => {
          console.log('查询失败', err)
        })

      // 写回find表
      find.where({
        _id: id
      }).update({
        data: {
          is_found: false
        }
      }).then(res => {
        console.log('成功写回', res)


        let find_rec_item = []


        for (let i = 0; i < this.data.find_rec_item.length; ++i) {
          if (i != index) find_rec_item.push(this.data.find_rec_item[i])
        }
        console.log('find_rec_item=', find_rec_item)
        this.setData({
          find_rec_item: find_rec_item
        })
        wx.showToast({
          title: '操作成功',
          icon: 'success'
        })
      })
        .catch(err => {
          console.log('查询失败', err)
        })

      // console.log('执行回调函数之外')



    })
      .catch(err => {
        console.log('查询失败', err)
      })




  },
  // 校园论坛取消收藏
  cancelForumCollection(e) {
    // 1. 只会修改favorite表
    // 2. 还要修改那个本表
    // 如何获取Id?
    // console.log('e=', e);
    let id = e.currentTarget.dataset.id
    let index = e.currentTarget.dataset.index
    console.log('index', index)
    console.log('e=', e);
    console.log('forum_fav_list[index]', this.data.forum_fav_list[index])

    console.log('openid', this.data.open_id);

    // 数据库操作
    favorite.where({
      open_id: this.data.open_id
    }).get().then(res => {
      console.log('成功查询', res)
      let obj = res.data[0].forum_favor
      // console.log('find_favor', obj)
      obj[id] = false
      // console.log('find_favor', obj)

      // 写回favorite
      favorite.where({
        open_id: this.data.open_id
      }).update({
        data: {
          forum_favor: obj
        }
      }).then(res => {
        console.log('成功协会', res)
        let forum_fav_item = []
        for (let i = 0; i < this.data.forum_fav_item.length; i++) {
          if (i != index) forum_fav_item.push(this.data.forum_fav_item[i])
        }
        this.setData({
          forum_fav_item: forum_fav_item
        })
        console.log('forum_fav_item', forum_fav_item)
        wx.showToast({
          title: '操作成功',
          icon: 'success'
        })
      })
        .catch(err => {
          console.log('查询失败', err)
        })

    })
      .catch(err => {
        console.log('查询失败', err)
      })




  },
  // 商品交易取消收藏
  cancelDealCollection(e) {
    // 1. 只会修改favorite表
    // 2. 还要修改那个本表
    // 如何获取Id?
    // console.log('e=', e);
    let id = e.currentTarget.dataset.id
    let index = e.currentTarget.dataset.index
    console.log('index', index)
    console.log('e=', e);
    console.log('deal_fav_list[index]', this.data.deal_fav_list[index])

    console.log('openid', this.data.open_id);

    // 数据库操作
    favorite.where({
      open_id: this.data.open_id
    }).get().then(res => {
      console.log('成功查询', res)
      let obj = res.data[0].deal_favor
      // console.log('find_favor', obj)
      obj[id] = false
      console.log('deal_favor', obj)

      // 写回favorite
      favorite.where({
        open_id: this.data.open_id
      }).update({
        data: {
          deal_favor: obj
        }
      }).then(res => {
        console.log('成功协会', res)
        let deal_fav_item = []
        for (let i = 0; i < this.data.deal_fav_item.length; i++) {
          if (i != index) deal_fav_item.push(this.data.deal_fav_item[i])
        }
        this.setData({
          deal_fav_item: deal_fav_item
        })
        console.log('deal_fav_item', deal_fav_item)
        wx.showToast({
          title: '操作成功',
          icon: 'success'
        })
      })
        .catch(err => {
          console.log('查询失败', err)
        })

    })
      .catch(err => {
        console.log('查询失败', err)
      })




  },

  /**
   * 页面的初始数据
   */
  data: {
    // 侧边栏列表
    sidebar_list: ['失物招领', '校园论坛', '商品交易'],
    // 侧边栏选中元素
    sidebar_chosen_item: 0,
    //显示撤回提示弹窗
    show_find_recall_confirm: false,
    show_forum_recall_confirm: false,
    show_deal_recall_confirm: false,

    // 撤回的元素下标
    recall_find_index: -1,
    recall_forum_index: -1,
    recall_deal_index: -1,


    // 数据库获取的变量
    open_id: '',
    find_rec_list: [],
    find_pub_list: [],
    forum_fav_list: [],
    forum_pub_list: [],
    deal_fav_list: [],
    deal_pub_list: [],

    find_rec_item: [],
    find_pub_item: [],
    forum_fav_item: [],
    forum_pub_item: [],
    deal_fav_item: [],
    deal_pub_item: [],

  },
  // 侧边栏选中
  sidebarOnChange: function (event) {
    this.setData({
      sidebar_chosen_item: event.detail,
    })
    console.log('event.detail', event.detail)
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
  //批量处理失物招领日期
  findSecondsToDates: function (res) {
    for (const v of res) {
      let time = this.secondsToDate(v.time_found)
      v.time_found = time
    }
    return res
  },
  //批量处理校园论坛日期
  forumSecondsToDates: function (res) {
    for (const v of res) {
      let time = this.secondsToDate(v.time_publish)
      v.time_publish = time
    }
    return res
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 加载提示
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
      mask: true,
    })

    wx.cloud
      .callFunction({
        name: 'login',
      })
      .then((res) => {
        this.setData({
          open_id: res.result.openid,
        })
        // 回调函数嵌套
        favorite.where({
          open_id: this.data.open_id
        }).get().then(res => {
          console.log('查询成功', res)
          let obj = res.data[0]
          // TODO 定义变量
          let find_favor = obj.find_favor
          let forum_favor = obj.forum_favor
          let deal_favor = obj.deal_favor

          // 收藏
          let find_rec_list = []
          let forum_fav_list = []
          let deal_fav_list = []
          Object.keys(find_favor).forEach(function (key) {
            if (find_favor[key] === true) {
              find_rec_list.push(key)
            }
          })
          Object.keys(forum_favor).forEach(function (key) {
            if (forum_favor[key] === true) {
              forum_fav_list.push(key)
            }
          })
          Object.keys(deal_favor).forEach(function (key) {
            if (deal_favor[key] === true) {
              deal_fav_list.push(key)
            }
          })
          // 发布
          let find_pub_list = Array.from(new Set(obj.lost_list))
          let forum_pub_list = Array.from(new Set(obj.forum_list))
          let deal_pub_list = Array.from(new Set(obj.deal_list))
          console.log('deal_pub_list', deal_pub_list)

          // TODO 交易字段后面补充
          this.setData({
            find_rec_list: find_rec_list,
            find_pub_list: find_pub_list,
            forum_fav_list: forum_fav_list,
            forum_pub_list: forum_pub_list,
            deal_fav_list: deal_fav_list,
            deal_pub_list: deal_pub_list
          })
          // console.log(find_rec_list)
          // console.log(find_pub_list)
          // console.log(forum_fav_list)
          // 失物招领领取查询
          find.where({
            _id: _.in(find_rec_list)
          }).get().then(res => {
            console.log('find_rev', res)
            this.findSecondsToDates(res.data)
            this.setData({
              find_rec_item: res.data
            })
            // console.log('data find_rec',this.data.find_rec_item)
          }).catch(err => {
            console.log('失败')
          })
          // 失物招领发布查询
          find.where({
            _id: _.in(find_pub_list)
          }).get().then(res => {
            //  console.log('find_pub', res)
            this.findSecondsToDates(res.data)
            this.setData({
              find_pub_item: res.data
            })
            // console.log('data find_pub',this.data.find_pub_item)
          }).catch(err => {
            console.log('失败')
          })
          // 校园论坛收藏查询
          forum.where({
            _id: _.in(forum_fav_list)
          }).get().then(res => {
            // console.log('forum_fav', res)
            this.forumSecondsToDates(res.data)
            this.setData({
              forum_fav_item: res.data
            })
            // console.log('data forum_fav',this.data.forum_fav_item)
          }).catch(err => {
            console.log('失败')
          })
          // 校园论坛发布查询
          forum.where({
            _id: _.in(forum_pub_list)
          }).get().then(res => {
            // console.log('forum_pub', res)
            this.forumSecondsToDates(res.data)
            this.setData({
              forum_pub_item: res.data
            })
            // console.log('data forum_fav',this.data.forum_fav_item)
          }).catch(err => {
            console.log('失败')
          })

          // 商品交易收藏查询
          deal.where({
            _id: _.in(deal_fav_list)
          }).get().then(res => {
            console.log('deal_fav', res)
            // this.forumSecondsToDates(res.data)
            this.setData({
              deal_fav_item: res.data
            })
            console.log('data deal_fav', this.data.deal_fav_item)
          }).catch(err => {
            console.log('失败')
          })

          // 商品交易发布查询
          deal.where({
            _id: _.in(deal_pub_list)
          }).get().then(res => {
            console.log('deal_pub', res)
            // this.forumSecondsToDates(res.data)
            this.setData({
              deal_pub_item: res.data
            })
            console.log('data deal_pub', this.data.deal_pub_item)
          }).catch(err => {
            console.log('失败')
          })

        }).catch(err => {
          console.log('查询用户id失败', err)
        })

      })


  },
  /**********************失物招领弹窗************************ */
  //  发出撤回弹窗
  recallFind: function (event) {
    this.setData({
      show_find_recall_confirm: true,
      recall_find_index: event.currentTarget.dataset.index
    })
  },
  //  撤回弹窗确认按钮 在数据库中删除这条记录并且在该页面中删除这条记录
  recallFindConfirm: function () {
    let index = this.data.recall_find_index
    // console.log('index',index)
    if (index == -1) return

    // 数据库删除
    find.where({
      _id: this.data.find_pub_item[index]._id
    }).remove().then(res => {
      console.log('删除成功', res)
      // 页面记录删除
      let pub_item = []
      for (let i = 0; i < this.data.find_pub_item.length; i++) {
        if (i != index) pub_item.push(this.data.find_pub_item[i])
      }
      // console.log('pub_item', pub_item)
      this.setData({
        find_pub_item: pub_item
      })
    }).catch(err => {
      console.log('删除失败', err)
    })
  },
  //  撤回弹窗取消按钮
  recallFindCancel: function () {
    this.setData({
      show_find_recall_confirm: false
    })
  },

  /**********************校园论坛撤回弹窗************************ */
  //  发出撤回弹窗
  recallForum: function (event) {
    this.setData({
      show_forum_recall_confirm: true,
      recall_forum_index: event.currentTarget.dataset.index
    })
  },
  //  撤回弹窗确认按钮 在数据库中删除这条记录并且在该页面中删除这条记录
  recallForumConfirm: function () {
    let index = this.data.recall_forum_index
    console.log('index', index)
    if (index == -1) return

    // 数据库删除
    forum.where({
      _id: this.data.forum_pub_item[index]._id
    }).remove().then(res => {
      console.log('删除成功', res)
      // 页面记录删除
      let pub_item = []
      for (let i = 0; i < this.data.forum_pub_item.length; i++) {
        if (i != index) pub_item.push(this.data.forum_pub_item[i])
      }
      console.log('pub_item', pub_item)
      this.setData({
        forum_pub_item: pub_item
      })
    }).catch(err => {
      console.log('删除失败', err)
    })
  },
  //  撤回弹窗取消按钮
  recallForumCancel: function () {
    this.setData({
      show_forum_recall_confirm: false
    })
  },

  /**********************商品交易撤回弹窗************************ */
  //  发出撤回弹窗
  recallDeal: function (event) {
    this.setData({
      show_deal_recall_confirm: true,
      recall_deal_index: event.currentTarget.dataset.index
    })
  },
  //  撤回弹窗确认按钮 在数据库中删除这条记录并且在该页面中删除这条记录
  recallDealConfirm: function () {
    let index = this.data.recall_deal_index
    console.log('index', index)
    if (index == -1) return

    // 数据库删除
    deal.where({
      _id: this.data.deal_pub_item[index]._id
    }).remove().then(res => {
      console.log('删除成功', res)
      // 页面记录删除
      let pub_item = []
      for (let i = 0; i < this.data.deal_pub_item.length; i++) {
        if (i != index) pub_item.push(this.data.deal_pub_item[i])
      }
      console.log('pub_item', pub_item)
      this.setData({
        deal_pub_item: pub_item
      })
    }).catch(err => {
      console.log('删除失败', err)
    })
  },
  //  撤回弹窗取消按钮
  recallDealCancel: function () {
    this.setData({
      show_deal_recall_confirm: false
    })
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
  }
})