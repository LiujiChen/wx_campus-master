// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env 参数说明：
  //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
  //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
  //   如不填则使用默认环境（第一个创建的环境）
  env: 'cloud-test-7g01teel75f4c8bd',
  traceUser: true,
})
const db = cloud.database()
const MAX_LIMIT = 20
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  // 先取出集合记录总数
  const countResult = await db.collection(event.table_name).where({
    // type: event.type,
    // location: event.location,
    // is_found: event.is_found,
    // time_found: _.gte(event.time_lower).and(_.lt(event.time_upper))
    type: undefined,
    location: event.location,
    is_found: undefined,
    time_found: undefined
  }).count()
  console.log(countResult)
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    //get()操作返回的是Promise对象，每获取一个Promise就压栈进入tasks数组
    const promise = db.collection(event.table_name).where({
      type: undefined,
      location: event.location,
      is_found: undefined,
      time_found: undefined
    }).skip(i * MAX_LIMIT).get()
    tasks.push(promise)
  }
  console.log(tasks)
  console.log(await Promise.all(tasks))
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
  // return (await Promise.all(tasks)).reduce((acc, cur) => {
  //   return {
  //     data: acc.data.concat(cur.data),
  //     errMsg: acc.errMsg,
  //   }
  // },0)
  return {
    event: event,
    task: tasks
  }
}