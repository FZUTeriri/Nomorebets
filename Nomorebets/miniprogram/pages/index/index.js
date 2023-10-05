// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
  },
  onLoad() {
  },
  start_game: function () {
    app.addClickAudio();
    wx.redirectTo({
        url: '/pages/game_select/game_select',
    })
  }
})
