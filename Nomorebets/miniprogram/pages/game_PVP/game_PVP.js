// pages/game_PVP/game_PVP.js
const app = getApp();
var current_times;
var point_image={
  1:"../resource/1.jpg",
  2:"../resource/2.jpg",
  3:"../resource/3.jpg",
  4:"../resource/4.jpg",
  5:"../resource/5.jpg",
  6:"../resource/6.jpg",
}

var mult_image={
  0:"../resource/zero.jpg",
  1:"../resource/one.jpg",
  2:"../resource/double.jpg",
  3:"../resource/triple.jpg",
}
class GAME{      
  constructor(player1, player2,flag,expect) {
    this.player1 = [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]];
    this.player2 = [
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0]];
    this.flag = 0;
    this.times=1;
  }

  update_dice(play1,play2){
    for(var i=0;i<5;i++){
      this.player1[0][i]=play1[0][i];
      this.player2[0][i]=play2[0][i];
      this.player1[1][i]=play1[1][i];
      this.player2[1][i]=play2[1][i];
    }
  }

  get_player1_lockdice(){
    return this.player1[1];
  }

  get_player1_initdice(){
    return this.player1[0];
  }

  player1_select(x){
    if( this.player1[0][x]!=0){
      this.player1[1][x]=this.player1[0][x];
      this.player1[0][x]=0;
    }
    return;
  }
  player1_return(x){
    if(this.player1[2][x]==0&& this.player1[1][x]!=0){
      this.player1[0][x]=this.player1[1][x];
      this.player1[1][x]=0;
    }
    return;
  }
  player1_lock(){
    for(var i=0;i<5;i++){
      if(this.player1[1][i]!=0){
        this.player1[2][i]=1;
      }
    }
    return;
  }

  player2_lock(){
    this.player2_select();
    for(var i=0;i<5;i++){
      if(this.player2[1][i]!=0){
        this.player2[2][i]=1;
      }
    }
    return;
  }
  player2_select(){
    const index_container=this.findMaxScoreIndexCombination(this.player2[0]);
    for(let x = 0;x<index_container.length;x++){
      if( this.player2[0][index_container[x]]!=0){
        this.player2[1][index_container[x]]=this.player2[0][index_container[x]];
        this.player2[0][index_container[x]]=0;
      }
    }
    return;
  }


  judgeShun(a) {
    let num = new Array(7).fill(0);
    for (let i = 0; i < 5; i++) {
      num[a[i]] += 1;
    }
    if (num.slice(1, 6).every((count) => count === 1)) {
      return 60;
    }
    if (num.slice(2, 7).every((count) => count === 1)) {
      return 60;
    }
    if (num.slice(1, 5).every((count) => count >= 1)) {
      return 30;
    }
    if (num.slice(2, 6).every((count) => count >= 1)) {
      return 30;
    }
    if (num.slice(3, 7).every((count) => count >= 1)) {
      return 30;
    }
    return 0;
  }
  
  judgeFour(a) {
    let count = 0;
    let maxCount = 0;
    for (let i = 0; i < 4; i++) {
      if (a[i] === a[i + 1]) {
        count += 1;
      } else {
        maxCount = Math.max(maxCount, count);
        count = 0;
      }
    }
    maxCount = Math.max(maxCount, count);
    if (maxCount === 3) {
      return 1;
    } else {
      return 0;
    }
  }
  
  judgeHulu(a) {
    if (
      a[2] === a[1] &&
      a[0] === a[2] &&
      a[0] === a[1] &&
      (a[3] === a[4])
    ) {
      return 1;
    }
    if (
      (a[2] === a[3] &&
        a[4] === a[2] &&
        a[3] === a[4]) &&
      (a[0] === a[1])
    ) {
      return 1;
    }
    return 0;
  }
  
  judgeThree(a) {
    if (
      a[2] === a[1] &&
      a[0] === a[2] &&
      a[0] === a[1]
    ) {
      return 1;
    }
    if (
      a[1] === a[2] &&
      a[1] === a[3] &&
      a[2] === a[3]
    ) {
      return 1;
    }
    if (
      a[2] === a[3] &&
      a[4] === a[2] &&
      a[3] === a[4]
    ) {
      return 1;
    }
    return 0;
  }
  
  judgeTwo(a) {
    a.sort();
    if (a[0] === a[1] && a[2] === a[3]) {
      return 1;
    }
    if (a[1] === a[2] && a[3] === a[4]) {
      return 1;
    }
    if (a[0] === a[1] && a[3] === a[4]) {
      return 1;
    }
    return 0;
  }
  
  getScore(a) {
    a.sort((x, y) => x - y);
    let basic = a.reduce((sum, num) => sum + num, 0);
    let price = 0;
    price = this.judgeShun(a);
    if (price !== 0) {
      return basic + price;
    } else if (a.every((x) => x === a[0])) {
      return basic + 100;
    } else if (this.judgeFour(a) === 1) {
      return basic + 40;
    } else if (this.judgeHulu(a) === 1) {
      return basic + 20;
    } else if (this.judgeThree(a) === 1 || this.judgeTwo(a) === 1) {
      return basic + 10;
    }
    return basic;
  }

  player1_score(){
    return this.getScore(this.player1[1]);
  }

  player2_score(){
    return this.getScore(this.player2[1]);
  }

}
function generateRandomArray() {
  const length = Math.floor(Math.random() * 6);  // 生成长度为0到5的随机数
  const array = [];

  while (array.length < length) {
    const num = Math.floor(Math.random() * 5);  // 生成0到4的随机数
    if (!array.includes(num)) {
      array.push(num);
    }
  }

  return array;
}
var GM=new GAME();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    player1_lock_text:"锁定区域",
    player2_lock_text:"锁定区域",
    player1_money:app.globalData.game_money,
    player2_money:app.globalData.game_money,
    cur_times:1,
    total_times:app.globalData.game_num,
    left_times:1,
    cur_mul:1,
    player1_dice:GM.player1[0],
    player2_dice:GM.player2[0],
    player1_lock:GM.player1[1],
    player2_lock:GM.player2[1],
    p_img:point_image,
    m_img:mult_image,
    player1_islock:false,
    player2_islock:false,
    player1_mult:-1,
    player2_mult:-1,
    times_isOver:false,
    socketOpen:false,
    isend:false,
    winnerinfo:"",
    roomname:null,
    myname:"玩家一",
    othername:"玩家二",
    isowner:null,
    isauto:false,
    auto_play:"托管"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    current_times=1;
    this.setData({player1_dice:GM.player1[0]}),
    this.setData({player2_dice:GM.player2[0]}),
    this.setData({player1_lock:GM.player1[1]}),
    this.setData({player2_lock:GM.player2[1]}),
    this.setData({player1_lock_text:"锁定区域"}),
    this.setData({player2_lock_text:"锁定区域"}),
    this.setData({player1_money:app.globalData.game_money});
    this.setData({player2_money:app.globalData.game_money});
    this.setData({cur_times:current_times});
    this.setData({total_times:app.globalData.game_num});
    this.setData({left_times:app.globalData.game_num-current_times});
    this.setData({cur_mul:1});
    this.setData({times_isOver:false});
    this.setData({player1_mult:-1});
    this.setData({player2_mult:-1});
    this.setData({player1_islock:false});
    this.setData({player2_islock:false});
    this.setData({p_img:point_image});
    this.setData({m_img:mult_image});
    this.setData({isauto:false});
    this.setData({winnerinfo:""});
    this.setData({
        roomname : wx.getStorageSync('roomname'),
        myname : wx.getStorageSync('myname'),
        othername : wx.getStorageSync('othername'),
        isowner : wx.getStorageSync('isfirst'),
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log("Ready");
    wx.connectSocket({
      url: app.globalData.serverurl,
    });
    wx.onSocketOpen(() => {
      if(!this.data.socketOpen){
        this.setData({
          socketOpen:true
        });
      }
      console.log(this.data.isowner);
      if(this.data.isowner){
        this.game_start();
      }
      this.game();
    });
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

  back_to_init: function () {
    app.addClickAudio();
    wx.navigateBack({
      delta: 1
    })
  },

  button_auto(){
    this.setData({isauto:!this.data.isauto});
    if(this.data.isauto)
      this.setData({auto_play:"托管中"});
    else{
      this.setData({auto_play:"托管"});
    }
  },

  auto_select(){
    const arr=generateRandomArray();
    this.player1auto_click(arr).then(() => {
      this.player1_button()
    })
    .catch((error) => {
      console.error('操作出错:', error);
    });
    if(this.data.player1_islock&&this.data.player2_islock&&this.data.player1_mult==-1){
      this.player1automult(Math.floor(Math.random() * 4));
    }
  },

  game_start(){
    console.log("gamestart")
    let socketMsg=["submitType=gamestart&roomName="+this.data.roomname];
    for(let i=0;i<socketMsg.length;i++){
      if(this.data.socketOpen){
        wx.sendSocketMessage({
          data: socketMsg[i],
        });
      }else{
        socketMsg.push(socketMsg[i]);
      }
    }
    socketMsg=[];
  },

  game() {
    let that=this;
    that.getdiceboard().then(() => {
      let interval = setInterval(() => {
        that.getdiceboard().then(() => {
          if (that.data.player1_mult !== -1 && that.data.player2_mult !== -1) {
            if (that.data.isowner) {
              that.sendrolldice();
              that.setData({ player1_lock_text: "锁定区域" });
            }
          }
          if (GM.times === 3) {
            that.setData({ times_isOver: true });
            that.times_over().then(() => {
            })
            .catch((error) => {
              console.error('操作出错:', error);
            });
          }else{
            if(that.data.isauto){
              that.auto_select();
            }
          }
          if (that.haswinner()) {

            clearInterval(interval);
            interval = null;
          }
          if (!interval) {
            wx.redirectTo({
              url:'/pages/game_end/game_end?mode=玩家二&money1='+that.data.player1_money+'&money2=' +that.data.player2_money,
            });
          }
        }).catch((error) => {
          console.error('接收数据包发生错误:', error);
        });
      }, 5000);
    }).catch((error) => {
      console.error('接收数据包发生错误:', error);
    });
  },

  sendinitTimes(){
    let socketMsg;
    socketMsg=["submitType=InitTimes&play=player1&roomName="+this.data.roomname];
    for(let i=0;i<socketMsg.length;i++){
      if(this.data.socketOpen){
        wx.sendSocketMessage({
          data: socketMsg[i],
        });
      }else{
        socketMsg.push(socketMsg[i]);
      }
    }
    socketMsg=[];
  },

  sendGameOver(){
    let that=this;
    return new Promise((resolve, reject) => {
        let socketMsg;
        socketMsg = ["submitType=GameOver&winner="+that.winnerinfo];
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
        resolve();
    });
  },


  init_times() {
    return new Promise((resolve, reject) => {
      if (!this.haswinner()) {
        this.setData({ times_isOver: false });
        this.setData({ player1_lock_text: "锁定区域" });
        if (this.data.isowner) {
          this.sendinitTimes();
        }
        resolve(); // 执行成功时调用 resolve()
      } else {
        this.sendGameOver().then(() => {
          wx.redirectTo({
            url: '/pages/game_end/game_end?mode=玩家二&money1=' + this.data.player1_money + '&money2=' + this.data.player2_money,
          });
          resolve(); // 执行成功时调用 resolve()
        }).catch(error => {
          reject(error); // 执行失败时调用 reject()
        });
      }
    });
  },

  times_over() {
    return new Promise((resolve, reject) => {
      const player1_score = GM.player1_score();
      const player2_score = GM.player2_score();
      let play1_money = 0;
      let play2_money = 0;
      const cur_mul = this.data.cur_mul;
  
      if (player1_score > player2_score) {
        play1_money = play1_money + Math.abs(player1_score - player2_score) * cur_mul;
        play2_money = play2_money - Math.abs(player1_score - player2_score) * cur_mul;
      } else {
        play1_money = play1_money - Math.abs(player1_score - player2_score) * cur_mul;
        play2_money = play2_money + Math.abs(player1_score - player2_score) * cur_mul;
      }
  
      this.setData({ player1_money: this.data.player1_money + play1_money });
      this.setData({ player2_money: this.data.player2_money + play2_money });
      this.init_times().then(() => {
          resolve();
      }).catch(error => {
        reject(error);
      });
    });
  },

  sendrolldice(){
    let socketMsg;
    socketMsg=["submitType=rollDice&play=player1&roomName="+this.data.roomname];
    for(let i=0;i<socketMsg.length;i++){
      if(this.data.socketOpen){
        wx.sendSocketMessage({
          data: socketMsg[i],
        });
      }else{
        socketMsg.push(socketMsg[i]);
      }
    }
    socketMsg=[];
  },

  player1_mult_Click(event){
    app.diceClickAudio();
    const mult = parseInt(event.currentTarget.dataset.index);
    this.setData({player1_mult:mult});
    this.setData({cur_mul:this.data.cur_mul+mult});
    let socketMsg;
    if(this.data.isowner){
      socketMsg=["submitType=addmult&play=player1&roomName="+this.data.roomname+"&mult="+mult];
    }else{
      socketMsg=["submitType=addmult&play=player2&roomName="+this.data.roomname+"&mult="+mult];
    }
    for(let i=0;i<socketMsg.length;i++){
      if(this.data.socketOpen){
        wx.sendSocketMessage({
          data: socketMsg[i],
        });
      }else{
        socketMsg.push(socketMsg[i]);
      }
    }
    socketMsg=[];
  },

  haswinner(){
    if(this.data.left_times<0){
      if(this.data.player1_money>this.data.player2_money){
        this.setData({winnerinfo:"player1"});
      }else if(this.data.player1_money<this.data.player2_money){
        this.setData({winnerinfo:"player2"});
      }else{
        this.setData({winnerinfo:"same"});
      }
      return true;
    }else if(this.data.player1_money<0){
      this.setData({winnerinfo:"player2"});
      return true;
    }else if(this.data.player2_money<0){
      this.setData({winnerinfo:"player1"});
      return true;
    }
    return false;
  },

  getdiceboard() {
    let that=this;
    return new Promise((resolve, reject) => {
      let socketMsg = ["submitType=getDiceBoard&roomName=" + that.data.roomname];
  
      const socketMessageHandler = function (res) {
        try {
          const responseData = JSON.parse(res.data);
          resolve(responseData);
        } catch (error) {
          console.error('无效的 JSON 字符串:', error);
          reject(error);
        }
      };
  
      if (that.data.socketOpen) {
        for (let i = 0; i < socketMsg.length; i++) {
          wx.sendSocketMessage({
            data: socketMsg[i],
          });
        }
      } else {
        socketMsg.push(...socketMsg);
      }
      socketMsg = [];
      wx.onSocketMessage(socketMessageHandler);
    })
      .then((responseData) => {
        if(responseData=="The room has been closed."){
          if(that.data.isowner){
            that.setData({player2_money:-9999});
          }else{
            that.setData({player1_money:-9999});
          }
           that.init_times(); 
        }
        if (that.data.isowner) {
          GM.update_dice(responseData["player1"], responseData["player2"]);
        } else {
          GM.update_dice(responseData["player2"], responseData["player1"]);
        }
        GM.times = parseInt(responseData["times"]);
        that.setData({ cur_mul: responseData["mul"] });
        that.setData({ cur_times: responseData["cur_times"] });
        that.setData({ total_times: responseData["total_times"] });
        that.setData({ player1_islock: responseData["player1Islock"] });
        that.setData({ player2_islock: responseData["player2Islock"] });
        that.setData({ player1_mult: responseData["player1Ismul"] });
        that.setData({ player2_mult: responseData["player2Ismul"] });
        that.setData({
          left_times: that.data.total_times - that.data.cur_times,
        });
        that.setData({ player1_dice: GM.player1[0] });
        that.setData({ player1_lock: GM.player1[1] });
        that.setData({ player2_dice: GM.player2[0] });
        that.setData({ player2_lock: GM.player2[1] });
      })
      .catch((error) => {
        console.error('接收数据包发生错误:', error);
      });
  },
  player1_select_Click(event) {
    if(!this.data.player1_islock){
      app.diceClickAudio();
      const index = event.currentTarget.dataset.index;
      GM.player1_select(index);
      var x =GM.get_player1_lockdice();
      console.log(x);
      let socketMsg;
      if(this.data.isowner){
        socketMsg=["submitType=selectDice&play=player1&roomName="+this.data.roomname+"&x1="+x[0]+"&x2="+x[1]+"&x3="+x[2]+"&x4="+x[3]+"&x5="+x[4]];
      }else{
        socketMsg=["submitType=selectDice&play=player2&roomName="+this.data.roomname+"&x1="+x[0]+"&x2="+x[1]+"&x3="+x[2]+"&x4="+x[3]+"&x5="+x[4]];
      }
      for(let i=0;i<socketMsg.length;i++){
        if(this.data.socketOpen){
          wx.sendSocketMessage({
            data: socketMsg[i],
          });
        }else{
          socketMsg.push(socketMsg[i]);
        }
      }
      socketMsg=[];
      this.setData({player1_dice:GM.player1[0]});
      this.setData({player1_lock:GM.player1[1]});
    } 
  },

  player1_return_Click(event) {
    if(!this.data.player1_islock){
      app.diceClickAudio();
      const index = event.currentTarget.dataset.index;
      GM.player1_return(index);
      var x =GM.get_player1_initdice();
      console.log(x);
      let socketMsg;
      if(this.data.isowner){
        socketMsg=["submitType=returnDice&play=player1&roomName="+this.data.roomname+"&x1="+x[0]+"&x2="+x[1]+"&x3="+x[2]+"&x4="+x[3]+"&x5="+x[4]];
      }else{
        socketMsg=["submitType=returnDice&play=player2&roomName="+this.data.roomname+"&x1="+x[0]+"&x2="+x[1]+"&x3="+x[2]+"&x4="+x[3]+"&x5="+x[4]];
      }
      for(let i=0;i<socketMsg.length;i++){
        if(this.data.socketOpen){
          wx.sendSocketMessage({
            data: socketMsg[i],
          });
        }else{
          socketMsg.push(socketMsg[i]);
        }
      }
      socketMsg=[];
      this.setData({player1_dice:GM.player1[0]});
      this.setData({player1_lock:GM.player1[1]});
    }   
  },
  player1_button(){
    if(!this.data.player1_islock){
      app.diceClickAudio();
      this.setData({player1_islock:!this.data.player1_islock});
      this.setData({player1_lock_text:"锁定区域(已锁)"});
      GM.player1_lock();
      let socketMsg;
      if(this.data.isowner){
        socketMsg=["submitType=Lock&play=player1&roomName="+this.data.roomname];
      }else{
        socketMsg=["submitType=Lock&play=player2&roomName="+this.data.roomname];
      }
      for(let i=0;i<socketMsg.length;i++){
        if(this.data.socketOpen){
          wx.sendSocketMessage({
            data: socketMsg[i],
          });
        }else{
          socketMsg.push(socketMsg[i]);
        }
      }
      socketMsg=[];
    }
  },

  player1auto_click(arr) {
    let that=this;
    return new Promise((resolve, reject) => {
      if (!that.data.player1_islock) {
        app.diceClickAudio();
        for (let i = 0; i < arr.length; i++) {
          GM.player1_select(arr[i]);
        }
        const x = GM.get_player1_lockdice();
        let socketMsg;
        if (that.data.isowner) {
          socketMsg = ["submitType=selectDice&play=player1&roomName="+that.data.roomname+"&x1="+x[0]+"&x2="+x[1] +"&x3="+x[2]+"&x4="+x[3]+"&x5="+x[4],];
        } else {
          socketMsg = ["submitType=selectDice&play=player2&roomName="+that.data.roomname+"&x1="+x[0]+"&x2="+x[1] +"&x3="+x[2]+"&x4="+x[3]+"&x5="+x[4],];
        }
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
        that.setData({ player1_dice: GM.player1[0] });
        that.setData({ player1_lock: GM.player1[1] });
  
        resolve();
      }
    });
  },

  player1automult(mult){
    app.diceClickAudio();
    this.setData({player1_mult:mult});
    this.setData({cur_mul:this.data.cur_mul+mult});
    let socketMsg;
    if(this.data.isowner){
      socketMsg=["submitType=addmult&play=player1&roomName="+this.data.roomname+"&mult="+mult];
    }else{
      socketMsg=["submitType=addmult&play=player2&roomName="+this.data.roomname+"&mult="+mult];
    }
    for(let i=0;i<socketMsg.length;i++){
      if(this.data.socketOpen){
        wx.sendSocketMessage({
          data: socketMsg[i],
        });
      }else{
        socketMsg.push(socketMsg[i]);
      }
    }
    socketMsg=[];
  }



})