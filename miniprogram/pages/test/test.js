Page({
  data: {
    option1: [
      { text: '全部类型', value: 'a0' },
      { text: '电子设备', value: 'a1' },
      { text: '证件', value: 'a2' },
      { text: '雨伞和水杯', value: 'a3' },
      { text: '衣物', value: 'a4' },
      { text: '文具', value: 'a5' },
      { text: '书籍', value: 'a6' },
      { text: '日用品', value: 'a7' },
      { text: '其他', value: 'a8' },
    ],
    option2: [
      { text: '全部地点', value: 'b0' },
      { text: '第一教学楼', value: 'b1' },
      { text: '综合楼', value: 'b2' },
      { text: '艺术楼', value: 'b3' },
      { text: '第一实验楼', value: 'b4' },
      { text: '第二实验楼', value: 'b5' },
      { text: '图书馆', value: 'b6' },
      { text: '一食堂和四食堂', value: 'b7' },
      { text: '二食堂', value: 'b8' },
      { text: '三食堂', value: 'b9' },
      { text: '学生活动中心', value: 'b10' },
      { text: '小剧场', value: 'b11' },
      { text: '大剧场', value: 'b12' },
      { text: '松园体育场', value: 'b13' },
      { text: '梅园体育场', value: 'b14' },
      { text: '校车站', value: 'b15' },
      { text: '其他地点', value: 'b16' },
    ],
    option3:[
      {text:'全部时间',value:'c0'},
      {text:'一天内',value:'c1'},
      {text:'三天内',value:'c2'},
      {text:'一周内',value:'c3'},
      {text:'更长时间',value:'c4'},
    ],
    option4:[
      {text:'全部状态',value:'d0'},
      {text:'已领取',value:'d1'},
      {text:'未领取',value:'d2'},
    ],
    value1: 'a0',
    value2: 'b0',
    value3: "c0",
    value4: 'd2',
  },

  closed({detail}){
    //console.log(DropdownItem.change.value);
    console.log(detail)
  }
});
