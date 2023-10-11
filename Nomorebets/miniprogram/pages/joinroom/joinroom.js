// pages/joinroom/joinroom.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    RoomName:"",
    RoomPsw:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      userInfo:app.globalData.userInfo
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
    wx.closeSocket({
      code: 4000,
    });
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
  back_to_init: function () {
    app.addClickAudio();
    wx.redirectTo({
      url: '/pages/game_select/game_select',
    })
  },

  requestJoinRoom: function () {
    if(this.data.RoomName == null || this.data.RoomName === ""){
      wx.showToast({
        title: '您需先添加房间名',
        icon: "none",
        duratiom:"1200"
      });
 
    }else{
      let socketOpen=false;
      let socketMsgQueue=["submitType=JoinRoom"+"&roomName="+this.data.RoomName+"&roomPsw="+this.data.RoomPsw+"&otherName="+this.data.userInfo.nickName];
      wx.connectSocket({
        url: app.globalData.serverurl,
      });

      wx.onSocketOpen((result) => {
        socketOpen=true;
        for(let i=0;i<socketMsgQueue.length;i++){
          if(socketOpen){
            wx.sendSocketMessage({
              data: socketMsgQueue[i],
            });
          }else{
            socketMsgQueue.push(socketMsgQueue[i]);
          }
        }
        socketMsgQueue=[];
      });

      wx.onSocketClose((result)=> {
        socketOpen=false;
      })
      wx.onSocketMessage((result) => {
        if(result.data === "dataFormatError"){
          wx.showToast({
            title: '连接服务器失败',
            duration:2000,
          });
        }else if(result.data === "findFail"){
          wx.showToast({
            title: '不存在或已满',
            duration:2000,
          });
        }else{
          console.log(result.data);
          let dataarr=result.data.split("&");
          try {
            wx.setStorageSync("roomname", this.data.RoomName);
            wx.setStorageSync("othername", dataarr[0].split('=')[1]);
            wx.setStorageSync("myname", this.data.userInfo.nickName);
            wx.setStorageSync( "isfirst", (dataarr[1].split('=')[1]==="true")?"true":"false");
          } catch (e) {
            console.error("设置对局信息错误");
           }finally{
              wx.navigateTo({
                url: '/pages/game_PVP/game_PVP',
              });
            }
        };
      });
    }
  },

  setRoomName: function(e){
    this.setData({
      RoomName:e.detail.value
    });
  },

  setRoomPsw: function(e){
    this.setData({
      RoomPsw:e.detail.value
    });
  },
})