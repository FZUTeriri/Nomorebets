// pages/game_rank/game_rank.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    res:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.connectSocket({
      url: 'ws://127.0.0.1:3001',
      success: () => {
        wx.onSocketOpen(() => {
          this.get_rank()
          .then(() => {
            console.log(this.data.res);
          })
          .catch((error) => {
            console.error('获取排名数据出错:', error);
          });
        });
      },
      fail: (error) => {
        console.error('建立 WebSocket 连接失败:', error);
      },
    });
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


  get_rank(){
    let socketMsg;
    socketMsg = ["submitType=getrank"];
    let that=this;
    return new Promise((resolve, reject) => {
      const socketMessageHandler = function (res) {
        try {
          const responseData = JSON.parse(res.data);
          resolve(responseData);
        } catch (error) {
          console.error('无效的 JSON 字符串:', error);
          reject(error);
        }
      };
      for (let i = 0; i < socketMsg.length; i++) {
          wx.sendSocketMessage({
            data: socketMsg[i],
          });
      }
      socketMsg = [];
      wx.onSocketMessage(socketMessageHandler);
    }).then((responseData) => {
      that.setData({res:responseData});
    }).catch((error) => {
      console.error('接收数据包发生错误:', error);
    });
  },
  back_to_init: function () {
    app.addClickAudio();
    wx.redirectTo({
        url: '/pages/game_select/game_select',
    })
  }
})