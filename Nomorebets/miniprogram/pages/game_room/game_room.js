// pages/game_room/game_room.js
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
    game_money:1000,
    socketOpen:false,
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
    this.setData({game_num:app.globalData.game_num});
    this.setData({game_money:app.globalData.game_money});
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
  createroom(){
    app.addClickAudio();
    wx.redirectTo({
      url: '/pages/createroom/createroom',
    })
  },
  joinroom(){
    app.addClickAudio();
    wx.redirectTo({
      url: '/pages/joinroom/joinroom',
    })
  },
  matchonline(){
    app.addClickAudio();
    let that=this;
    let socketMsgQueue=["submitType=OnlineMatch"];
    wx.connectSocket({
      url: 'ws://127.0.0.1:3001',
    });
    wx.onSocketOpen((result) => {
      that.data.socketOpen=true;
      for(let i=0;i<socketMsgQueue.length;i++){
        if(that.data.socketOpen){
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
      if(result.data === "Waiting for another player..."){
        wx.showLoading({
          title: '匹配中',
        });
      }else if(result.data === "dataFormatError"){
        wx.showToast({
          title: '连接服务器失败',
          duration:2000,
        });
      }else{
          let dataarr=result.data.split('&');
          this.data.RoomName=dataarr[0].split('=')[1];
          if(dataarr[0].split('=')[1] === this.data.RoomName){
            wx.hideLoading({
              complete: (res) => {
                console.log("othername="+dataarr[1].split('=')[1]);
                try {
                  wx.setStorageSync("roomname", this.data.RoomName);
                  wx.setStorageSync( "myname", this.data.userInfo.nickName);
                } catch (e) { 
                  console.error("设置对局信息错误");
                } finally{
                  if(dataarr[1].split('=')[1]==="Player1"){
                    this.CreateRoom();
                  }else if(dataarr[1].split('=')[1]==="Player2"){
                    this.JoinRoom();
                  }
                }
              },
            })
          }
      }
    });  


  },

  CreateRoom:function(){
      let socketMsgQueue=["submitType=CreateRoom"+"&roomName="+this.data.RoomName+"&roomPsw=123&ownerName="+this.data.userInfo.nickName+"&initmoney=1000&totaltimes=10"];
      for(let i=0;i<socketMsgQueue.length;i++){
          wx.sendSocketMessage({
            data: socketMsgQueue[i],
          });
      }
      socketMsgQueue=[];
      wx.onSocketClose((result)=> {
        socketOpen=false;
      })
      wx.onSocketMessage((result) => { 
        if(result.data === "createSuccess"){
          wx.showLoading({
            title: '等待他人进入',
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
                    wx.setStorageSync( "othername", dataarr[1].split('=')[1]);
                    wx.setStorageSync("isfirst", true);
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
    
  },

  JoinRoom: function () {
      let socketMsgQueue=["submitType=JoinRoom"+"&roomName="+this.data.RoomName+"&roomPsw=123&otherName="+this.data.userInfo.nickName];
      for(let i=0;i<socketMsgQueue.length;i++){
        wx.sendSocketMessage({
          data: socketMsgQueue[i],
        });
    }
    socketMsgQueue=[];

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
  },



})