const db = wx.cloud.database()
const fav = db.collection('favorite')
const _ = db.command
const forum = db.collection('forum')
const com = db.collection('comments')

Page({
  data: {
    // 评论区模块
    comments: [],
    show_comments: false,
    comment_value: '',
    message: '',
    best_comments: [],
    // 记录的id
    id: '',
    // 当前用户的open_id
    open_id: '',
    // 头像和昵称

    item: {},

    // flag变量
    is_exist: false,
    is_like_active: false,
    is_unlike_active: false,
    is_favorite_active: false,
    show_dialog: false,
    // 图标
    favorite_inactive: 'https://i.loli.net/2021/05/16/CPlNB87ZrRchuVj.png',
    favorite_active: 'https://i.loli.net/2021/05/23/Z3L5x1JQXWYhwNB.png',
    like_inactive: 'https://i.loli.net/2021/05/16/nVSlfd8mOEwkLiG.png',
    like_active: 'https://i.loli.net/2021/05/16/JHQjYt7bo9lnA24.png',
    // like_active: '../../icons/like.png',
    unlike_inactive: 'https://i.loli.net/2021/05/16/v2pxGPajCRQwByt.png',
    unlike_active: 'https://i.loli.net/2021/05/16/ut864lOIsHW72Jk.png',

    animation_like: {},
    animation_dislike: {},
    animation_favorite: {},
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    // * 获取并设置当前用户的openid
    // 这是关于收藏的模块
    wx.cloud
      .callFunction({
        name: 'login',
      })
      .then((res) => {
        this.setData({
          open_id: res.result.openid,
        })
        // 套娃把查询帖子id
        forum
          .doc(options.id)
          .get()
          .then((res) => {
            console.log('成功', res)

            // 处理时间
            let tim = this.secondsToDate(res.data.time_publish)
            res.data.time_publish = tim

            // 初始化赞和踩
            let is_like_at_start =
              res.data.likes_id.indexOf(this.data.open_id) != -1
            let is_dislike_at_start =
              res.data.dislikes_id.indexOf(this.data.open_id) != -1

            // console.log(res.data)
            // 重新设置
            this.setData({
              id: options.id,
              item: res.data,
              is_like_active: is_like_at_start,
              is_unlike_active: is_dislike_at_start,
            })

            // 富文本初始化
            let that = this
            //content是从数据库获取的数据里的delta字符串，然后装换为json
            // console.log('that.data.item.content',that.data.item.content)
            var content = JSON.parse(that.data.item.content)
            // console.log('content=',content)
            wx.createSelectorQuery()
              .select('#editor')
              .context(function (res) {
                that.editorCtx = res.context
                that.editorCtx.setContents({
                  delta: content,
                })
              })
              .exec()
          })
          .catch((err) => {
            console.log('失败', err)
          })

        // 数据库查询该记录的收藏状态
        fav
          .where({
            open_id: this.data.open_id,
          })
          .get()
          .then((res) => {
            let forum_id = options.id
            let forum_favor = res.data[0].forum_favor
            // let list = Object.keys(forum_favor)
            // console.log('forum_favor=',forum_favor)
            // console.log('list=',list)
            // console.log('Object.keys(forum_favor)=', Object.keys(forum_favor));
            // 找到key 并且为true, iscollected置位true
            // var exist = list.find(function (e) {
            //   return e === forum_id
            // })
            // console.log('exist=',exist)
            // this.setData({
            //   is_exist: exist,

            // })
            // var exist = false
            console.log('forum_id', forum_id)
            console.log('forun_favor', forum_favor)
            for (var key in forum_favor) {
              if (key === forum_id && forum_favor[key]) {
                this.setData({
                  is_favorite_active: true
                })
                break
              }
            }

            // if (exist) {
            //   console.log('iscollected')
            //   this.setData({
            //     is_favorite_active: true
            //   })
            // }
          })
          .catch((err) => {
            console.log('数据库的锅', err)
          })
      })
      .catch((err) => { })

    com.where({
      forum_id: this.data.id
    }).get().then(res => {
      console.log('评论加载陈宫', res);

    })
      .catch(err => {
        console.log('', err);
      })
  },
  /* 处理时间模块 */
  // 说明: 不显示秒 + 时间补0
  secondsToDate(seconds) {
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
  // 批量处理时间
  secondsToDates: function (res) {
    for (const v of res) {
      let time = this.secondsToDate(v.time_publish)
      v.time_publish = time
    }
    return res
  },
  /* 评论区的展开和折叠 */
  hideComments() {
    this.setData({
      show_comments: false
    })
  },
  showComments() {
    this.setData({
      show_comments: true
    })
    com.where({
      forum_id: this.data.id
    }).get().then(res => {
      // 查看这条评论赞的人是否包含用户自己
      for (var item of res.data) {
        item.is_user_like = item.likes_id.indexOf(this.data.open_id) != -1
      }
      // console.log('评论加载陈宫', res);
      let comments_cpy = res.data.sort(function (a, b) { return b.time_publish - a.time_publish })
      let best_comments = []
      //取热度前三的数据
      let maxx = { likes: 0 }, midd = { likes: 0 }, minn = { likes: 0 }
      for (var item of comments_cpy) {
        if (item.likes > maxx.likes) {
          minn = midd
          midd = maxx
          maxx = item
        }
        else if (item.likes > midd.likes) {
          minn = midd
          midd = item
        }
        else if (item.likes > minn.likes) minn = item
      }
      if (maxx.likes > 0) best_comments.push(maxx)
      if (midd.likes > 0) best_comments.push(midd)
      if (minn.likes > 0) best_comments.push(minn)

      console.log('best_comments', best_comments)
      this.setData({
        comments: this.secondsToDates(comments_cpy),
        best_comments: best_comments
      })
      console.log('comments', this.data.comments);
    })
      .catch(err => {
        console.log('', err);
      })
  },
  // 评论点赞
  changeCommentLike(event) {
    // console.log(event)
    // console.log('评论数组',this.data.comments)
    // console.log(event.currentTarget.dataset.index)
    let index = event.currentTarget.dataset.index

    let flag = !this.data.comments[index].is_user_like
    let likes = this.data.comments[index].likes
    if (flag) {
      likes++
      this.data.comments[index].likes_id.push(this.data.open_id)
    }
    else {
      likes--
      let ind = this.data.comments[index].likes_id.indexOf(this.data.open_id)
      this.data.comments[index].likes_id.splice(ind, 1)
    }

    this.setData({
      ['comments[' + index + '].is_user_like']: flag,
      ['comments[' + index + '].likes']: likes
    })
    // console.log('flag',flag)
    // console.log('comments',this.data.comments)
    // console.log('修改后',this.data.comments[event.currentTarget.dataset.index].is_user_like)
    //数据库修改
    com.where({
      _id: this.data.comments[index]._id
    }).update({
      data: {
        likes: this.data.comments[index].likes,
        likes_id: this.data.comments[index].likes_id
      },
    }).then(res => {
      console.log('修改评论区个人点赞成功', res)
    }).catch(err => {
      console.log('失败', err)
    })
  },

  // 最热评论点赞
  changeBestCommentLike(event){
    // console.log(event)
    // console.log('评论数组',this.data.comments)
    // console.log(event.currentTarget.dataset.index)
    let index = event.currentTarget.dataset.index

    let flag = !this.data.best_comments[index].is_user_like
    let likes = this.data.best_comments[index].likes
    if(flag){
      likes ++
      this.data.best_comments[index].likes_id.push(this.data.open_id)
    } 
    else{
      likes --
      let ind = this.data.best_comments[index].likes_id.indexOf(this.data.open_id)
      this.data.best_comments[index].likes_id.splice(ind,1)
    } 

    this.setData({
      ['best_comments[' + index + '].is_user_like']: flag,
      ['best_comments[' + index + '].likes']: likes
    })
    // console.log('flag',flag)
    // console.log('best_comments',this.data.best_comments)
    // console.log('修改后',this.data.best_comments[event.currentTarget.dataset.index].is_user_like)
    //数据库修改
    com.where({
      _id: this.data.best_comments[index]._id
    }).update({
      data: {
        likes: this.data.best_comments[index].likes,
        likes_id: this.data.best_comments[index].likes_id
      },
    }).then(res => {
      console.log('修改评论区个人点赞成功',res)
    }).catch(err=>{
      console.log('失败',err)
    })
  },
  // 评论输入库修改
  onChangeInput(event) {
    this.setData({
      comment_value: event.detail
    })
  },
  onCommentSubmit(event) {
    // 获取头像和昵称
    fav.where({
      open_id: this.data.open_id
    }).get().then(res => {
      console.log('res', res);
      let obj = res.data[0]
      console.log('obj', obj);
      let username = obj.userNickName
      let userimage = obj.userAvatarUrl
      console.log('username', username);
      console.log('userimage', userimage);

      let now = Date.parse(new Date())
      this.setData({
        message: ''
      })
      com.add({
        data: {
          content: this.data.comment_value,
          forum_id: this.data.id,
          publisher_id: this.data.open_id,
          time_publish: now,
          likes: 0,
          likes_id: [],
          user_name: username,
          user_image: userimage
        }
      }).then(res => {
        console.log('评论发布成功', res);
        wx.showToast({
          title: '评论发布成功',
        })
        this.showComments()
      })
        .catch(err => {
          console.log('', err);
        })

    })
      .catch(err => {
      })
    // let user_name = event.detail.userInfo.nickName
    // let user_image = event.detail.userInfo.avatarUrl
  },
  cancelCommentSubmit() {
    wx.showToast({
      title: '取消了评论',
    })
  },

  // 弹出评论框
  showCommentDialog() {
    this.setData({
      show_dialog: true
    })
  },
  // 收藏函数
  changeFavorite() {
    let favorite = !this.data.is_favorite_active
    if (favorite) this.transition(2)
    this.setData({
      is_favorite_active: favorite,
    })

    let title = favorite ? '收藏成功' : '取消收藏'
    wx.showToast({
      title,
      icon: 'success'
    })

    fav
      .where({
        open_id: this.data.open_id,
      })
      .get()
      .then((res) => {
        // console.log('查询结果', res)

        // 获取记录信息的对象
        let forum_favor = res.data[0].forum_favor
        let lost_id = this.data.id
        console.log('成功,当前用户forum_favor=', forum_favor)

        let list = Object.keys(forum_favor)

        let exist = list.find(function (e) {
          return e === lost_id
        })

        if (exist) {
          // console.log('存在')
          let flag = !forum_favor[lost_id]
          forum_favor[lost_id] = flag
        } else {
          // console.log('不存在')
          forum_favor[lost_id] = true
        }
        console.log('forum_favor=', forum_favor)

        // 写回数据库
        fav
          .where({
            open_id: this.data.open_id,
          })
          .update({
            data: {
              forum_favor: forum_favor,
            },
          })
          .then((res) => {
            console.log('写回数据库成功', res)
          })
          .catch((err) => {
            console.log('', err)
          })
      })
      .catch((err) => {
        console.log('', err)
      })
  },

  //   点击图标动画效果函数
  transition: function (index) {
    //   动画效果
    this.animation = wx.createAnimation({
      duration: 300, // 动画持续时间，单位 ms
      timingFunction: 'linear', // 动画的效果
      delay: 10, // 动画延迟时间，单位 ms
      transformOrigin: '50% 50%' // 动画的中心点
    })

    setTimeout(function () {

      this.animation.scale(1.5).step();
      this.animation.scale(1.0).step();
      if (index == 0)
        this.setData({
          animation_like: this.animation.export()
        })
      else if (index == 1)
        this.setData({
          animation_dislike: this.animation.export()
        })
      else
        this.setData({
          animation_favorite: this.animation.export()
        })

    }.bind(this), 50);
  },
  // 点赞函数
  changeLike: function () {
    let like = !this.data.is_like_active
    let dislike = this.data.is_unlike_active
    let likes = this.data.item.likes
    let dislikes = this.data.item.dislikes
    // let choseChange = "item[" + index + "].chose"
    if (like) {
      likes++
      this.data.item.likes_id.push(this.data.open_id)
      // console.log('id=',this.data.open_id)
      // console.log('成功没有=',this.data.item.likes_id)
      // 动画效果
      this.transition(0)

    } else {
      likes--
      var index = this.data.item.likes_id.indexOf(this.data.open_id)
      if (index > -1) this.data.item.likes_id.splice(index, 1)
      // console.log('已经取消点赞')
    }
    // 解决冲突
    if (like && dislike) {
      dislike = false
      dislikes--
      var index = this.data.item.dislikes_id.indexOf(this.data.open_id)
      if (index > -1) this.data.item.dislikes_id.splice(index, 1)
      // console.log('已经解决冲突')
    }
    this.setData({
      is_like_active: like,
      is_unlike_active: dislike,
      ['item.likes']: likes,
      ['item.dislikes']: dislikes,
    })

    // console.log('openid=', this.data.open_id)
    // console.log('点赞人=', this.data.item.likes_id)
    // console.log('点踩人=', this.data.item.dislikes_id)
    let likes_id = this.data.item.likes_id
    let dislikes_id = this.data.item.dislikes_id
    forum
      .doc(this.data.id)
      .update({
        data: {
          likes_id: likes_id,
          dislikes_id: dislikes_id,
          likes: likes,
          dislikes: dislikes,
        },
      })
      .then((res) => {
        console.log('写回数据库', res)
      })
      .catch((err) => {
        console.log('失败', err)
      })

    // console.log('likes=', this.data.item.likes)
    // console.log('like_active', this.data.is_like_active)
  },
  // 点踩函数
  changeUnlike: function () {
    // console.log('成功')
    let like = this.data.is_like_active
    let dislike = !this.data.is_unlike_active
    let likes = this.data.item.likes
    let dislikes = this.data.item.dislikes
    // let choseChange = "item[" + index + "].chose"
    if (dislike) {
      dislikes++
      this.data.item.dislikes_id.push(this.data.open_id)
      // 动画效果
      this.transition(1)
    } else {
      dislikes--
      let index = this.data.item.dislikes_id.indexOf(this.data.open_id)
      if (index != -1) this.data.item.dislikes_id.splice(index, 1)
    }
    // 解决冲突
    if (dislike && like) {
      like = false
      likes--
      let index = this.data.item.likes_id.indexOf(this.data.open_id)
      if (index != -1) this.data.item.likes_id.splice(index, 1)
    }
    this.setData({
      is_like_active: like,
      is_unlike_active: dislike,
      ['item.likes']: likes,
      ['item.dislikes']: dislikes,
    })
    forum
      .doc(this.data.id)
      .update({
        data: {
          likes_id: this.data.item.likes_id,
          dislikes_id: this.data.item.dislikes_id,
          likes: likes,
          dislikes: dislikes,
        },
      })
      .then((res) => {
        // console.log('点赞按钮修改成功')
      })
      .catch((err) => {
        console.log('失败', err)
      })
  },

})
