const db = wx.cloud.database()
const fav = db.collection('favorite')
const _ = db.command
const deal = db.collection('Deal')
Page({
  data: {
    // 图标url
    favorite_inactive: 'https://ftp.bmp.ovh/imgs/2021/05/a046bb1dc2c0540a.png',
    favorite_active: 'https://ftp.bmp.ovh/imgs/2021/05/ec709308f347b170.png',
    // flag变量
    is_active: false,
    is_exist: false,
    // 记录的id
    id: '',
    // 当前用户的open_id
    open_id: '',
    // 当前item的数据库记录
    item: {},
    // 用户的二手交易收藏列表
    deal_favor: []
  },
  onLoad(options) {
    // console.log(options.id)
    // 根据物品id查询这条记录
    deal.where({
      _id: options.id
    }).get().then(res => {
      // console.log('res', res)
      this.setData({
        item: res.data[0],
        id: options.id
      })

    }).catch(err => {
      console.log('查询失败', err)
    })
    // 根据物品id查询是否收藏
    // 先查询用户id
    wx.cloud
      .callFunction({
        name: 'login',
      })
      .then((res) => {
        this.setData({
          open_id: res.result.openid
        })
        // console.log('openid', this.data.open_id)
        fav.where({
          open_id: res.result.openid
        }).get().then(res1 => {
          console.log('res1', res1)
          let deal_favor = res1.data[0].deal_favor
          this.setData({
            deal_favor: deal_favor,
          })
          // for(var key in deal_favor) {
          //   if(key == options.id){
          //     this.setData({
          //       is_exist: true
          //     })
          //     if(deal_favor[key]){
          //       this.setData({
          //         is_active: true
          //       })
          //     }
          //   }
          // }
          // console.log('修改前',deal_favor)

          /* 完美符合需求
          case1: 不存在 ==> 该表达式的值为undefined, 进入else
          case2: 存在, false ==> 进入else
          case3: 存在, true ==> 进入if
           */
          if (deal_favor[options.id]) {
            this.setData({
              is_active: true
            })
          }
          else {
            deal_favor[options.id] = false
            // console.log('修改后',deal_favor)
          }
        })
      })
  },

  changeIconFavorite() {
    /* 修改页面变量 */
    let flag = !this.data.is_active
    this.setData({
      is_active: flag,
    })
    /* 修改数据库 */
    this.data.deal_favor[this.data.id] = flag
    // console.log('修改的deal_favor',this.data.deal_favor)
    fav.where({
      open_id: this.data.open_id
    }).update({
      data: {
        deal_favor: this.data.deal_favor
      }
    }).then(res => {
      console.log('写回数据库成功', res)
    }).catch(err => {
      console.log('协会失败', err)
    })

    /* 弹窗 */
    let title = this.data.is_active ? '已收藏' : '取消收藏'
    wx.showToast({
      title,
      icon: 'success',
    })
  },
  //图片放大
  preview_picture(event) {
    console.log(event)
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })
  },
})
