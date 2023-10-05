// pages/game_end/game_end.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    player1_money:1000,
    player2_money:1000,
    mode:"玩家二"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({mode:options.mode});
    this.setData({player1_money:options.money1});
    this.setData({player2_money:options.money2});
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
  back_to_next: function () {
    app.addClickAudio();
    wx.redirectTo({
        url: '/pages/game_select/game_select',
    })
  }
})