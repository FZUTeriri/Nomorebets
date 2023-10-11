// pages/game_select.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    socketOpen:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({socketOpen:false});
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
    wx.closeSocket({
      code: 4000,
    });
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

  login() {
    let that=this;
        wx.getUserProfile({
            desc: '必须授权才能继续使用', // 必填 声明获取用户个人信息后的用途，后续会展示在弹窗中
            success:(res)=> { 
                console.log('授权成功', res);
                app.globalData.userInfo=res.userInfo;
                wx.connectSocket({
                  url: app.globalData.serverurl,
                });
            },
            fail:(err)=> {
                console.log('授权失败', err);
            }
        })
        wx.onSocketOpen(() => {
          if(!this.data.socketOpen){
            this.setData({
              socketOpen:true
            });
          }
        let socketMsg;
        socketMsg = ["submitType=login&name="+app.globalData.userInfo.nickName];
        for (let i = 0; i < socketMsg.length; i++) {
          if (that.data.socketOpen) {
            wx.sendSocketMessage({
              data: socketMsg[i],
            });
          } else {
            socketMsg.push(socketMsg[i]);
          }
        }
        socketMsg = [];
        }); 
    },

  back_to_init: function () {
    app.addClickAudio();
    wx.redirectTo({
        url: '/pages/index/index',
    })
  },
  rule: function () {
    app.addClickAudio();
    wx.redirectTo({
      url: '/pages/rule/rule',
    })
  },
  location: function (e) {
    app.addClickAudio();
    wx.redirectTo({
      url: '/pages/game_set/game_set?page=0',
    })
  },
  PVE: function (e) {
    app.addClickAudio();
    wx.redirectTo({
      url: '/pages/game_set/game_set?page=1',
    })
  },
  PVP: function (e) {
    app.addClickAudio();
    if(!app.globalData.userInfo){
      this.login();
    }else{
      wx.redirectTo({
        url: '/pages/game_room/game_room',
      })
    }
    
  },
  rank: function (e) {
    app.addClickAudio();
    wx.redirectTo({
      url: '/pages/game_rank/game_rank',
    })
  },

})