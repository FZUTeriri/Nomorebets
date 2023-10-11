// pages/createroom/createroom.js
const app = getApp()
var num;
var money;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    RoomName:"",
    RoomPsw:"",
    game_num:10,
    game_money:1000
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      userInfo:app.globalData.userInfo
    });
    num=app.globalData.game_num;
    money=app.globalData.game_money;
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
  back_to_init: function () {
    app.addClickAudio();
    wx.redirectTo({
      url: '/pages/game_select/game_select',
    })
  },
  createRoom:function(){
    if(this.data.RoomName == null || this.data.RoomName === ""){
      wx.showToast({
        title: '您需先添加房间名',
        icon: "none",
        duratiom:"1200"
      });
 
    }else{
      console.log("sucess");
      let socketOpen=false;
      let socketMsgQueue=["submitType=CreateRoom"+"&roomName="+this.data.RoomName+"&roomPsw="+this.data.RoomPsw+"&ownerName="+this.data.userInfo.nickName+"&initmoney="+this.data.game_money+"&totaltimes="+this.data.game_num];
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
    
      wx.onSocketMessage((result) => { 
        if(result.data === "createSuccess"){
          wx.showLoading({
            title: '等待他人进入',
          });
        }else if(result.data === "createFail"){
          wx.showToast({
            title: '房间号正被使用',
            duration:2000,
          });
        }else if(result.data === "dataFormatError"){
          wx.showToast({
            title: '连接服务器失败',
            duration:2000,
          });
        }else{
            let dataarr=result.data.split('&');
            if(dataarr[0].split('=')[1] === this.data.RoomName){
              wx.hideLoading({
                complete: (res) => {
                  console.log("othername="+dataarr[1].split('=')[1]);
                  try {
                    wx.setStorageSync("roomname", this.data.RoomName);
                    wx.setStorageSync( "myname", this.data.userInfo.nickName);
                    wx.setStorageSync("isfirst", true);
                    wx.setStorageSync( "othername", dataarr[1].split('=')[1]);
                  } catch (e) { 
                    console.error("设置对局信息错误");
                  } finally{
                    wx.navigateTo({
                      url: '/pages/game_PVP/game_PVP',
                    });
                  }
                },
              })
            }
        }
      });   
    }
  },


  setRoomName:function(e){
    this.setData({
      RoomName:e.detail.value 
    });
  },

  setRoomPsw:function(e){
    this.setData({
      RoomPsw:e.detail.value
    });
  },
  add_times: function () {
    app.addClickAudio();
    if(num>=10&&num<100){
      num=num+10;
      this.setData({game_num:num});
    }
    app.globalData.game_num=num;
  },
  sub_times: function () {
    app.addClickAudio();
    if(num<=100&&num>10){
      num=num-10;
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
  }
})