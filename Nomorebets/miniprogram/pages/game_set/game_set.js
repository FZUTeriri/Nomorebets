// pages/game_set/game_set.js
const app = getApp()
var a;
var num;
var money;
var p=[
  "/pages/game_location/game_location",
  "/pages/game_PVE/game_PVE",
];
Page({
  data: {
    page:p[a],
    game_num:10,
    game_money:1000,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    a=options.page;
    num=app.globalData.game_num;
    money=app.globalData.game_money;
    this.setData({page:p[a]});
    this.setData({game_num:num});
    this.setData({game_money:money});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  back_to_init: function () {
    app.addClickAudio();
    wx.redirectTo({
      url: '/pages/game_select/game_select',
    })
  },
  add_times: function () {
    app.addClickAudio();
    if(num>=5&&num<100){
      num=num+5;
      this.setData({game_num:num});
    }
    app.globalData.game_num=num;
  },
  sub_times: function () {
    app.addClickAudio();
    if(num<=100&&num>5){
      num=num-5;
      this.setData({game_num:num});
    }
    app.globalData.game_num=num;
  },
  add_money: function () {
    app.addClickAudio();
    if(money>=500&&money<10000){
      money=money+500;
      this.setData({game_money:money});
    }
    app.globalData.game_money=money;
  },
  sub_money: function () {
    app.addClickAudio();
    if(money>500&&money<=10000){
      money=money-500;
      this.setData({game_money:money});
    }
    app.globalData.game_money=money;
  },
  begin: function () {
    app.addClickAudio();
    wx.redirectTo({
      url: p[a],
    })
  }
  

})