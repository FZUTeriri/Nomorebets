// pages/rule/rule.js
const app = getApp()
var a;
var p = [
  "https://ooo.0x0.ooo/2023/10/02/O1TKQv.jpg",
  "https://ooo.0x0.ooo/2023/10/02/O1TrqU.jpg",
  "https://ooo.0x0.ooo/2023/10/02/O1T1bx.png",
  "https://ooo.0x0.ooo/2023/10/02/O1T7gj.png",
  "https://ooo.0x0.ooo/2023/10/02/O1TNVp.jpg",
];
Page({

  data: {
    rule_page:p[a],
    hidden:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    a=0;
    this.setData({rule_page:p[a]});
    this.setData({hidden:false});
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

  back_to_home: function () {
    app.addClickAudio()
    wx.redirectTo({
        url: '/pages/game_select/game_select',
    })
  },
  back_to_last: function () {
    app.addClickAudio()
    if (a != 0) {
        a = a - 1;
        this.setData({ rule_page: p[a] });
        if (a != 4) {
          this.setData({hidden:false});
        }
    }else{
      wx.redirectTo({
        url: '/pages/game_select/game_select',
      })
    }
  },
  back_to_next: function () {
    app.addClickAudio()
    if (a != 4) {
        a = a + 1;
        this.setData({ rule_page: p[a] });
        if (a == 4) {
          this.setData({hidden:true});
        }
    }
  }
 
})