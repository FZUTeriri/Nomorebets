// pages/game_loaction/game_location.js
const app = getApp()
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
  constructor(player1, player2) {
    this.player1 = [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]];
    this.player2 = [
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0]];
    this.times=1;
  }

  init_game(){
    this.times=1;
    for(let i=0;i<5;i++){
      this.player1[1][i]=0;
      this.player1[2][i]=0;
      this.player1[0][i]=Math.floor(Math.random()*6)+1;
      this.player2[1][i]=0;
      this.player2[2][i]=0;
      this.player2[0][i]=Math.floor(Math.random()*6)+1;
    }
    return;
  }
  role_dice(){
    this.times=this.times+1;
      for(let i=0;i<5;i++){
        if(this.player1[0][i]!=0){
          this.player1[0][i]=Math.floor(Math.random()*6)+1;
        }
        if(this.player2[0][i]!=0){
          this.player2[0][i]=Math.floor(Math.random()*6)+1;
        }
      }
    return this.times;
  }
  lock_dice(){
    for(let i=0;i<5;i++){
      if(this.player1[0][i]!=0){
        this.player1[1][i]=this.player1[0][i];
        this.player1[0][i]=0;
      }
      if(this.player2[0][i]!=0){
        this.player2[1][i]=this.player2[0][i];
        this.player2[0][i]=0;
      }
    }
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
    for(var i=0;i<5;i++){
      if(this.player2[1][i]!=0){
        this.player2[2][i]=1;
      }
    }
    return;
  }
  player2_select(x){
    if( this.player2[0][x]!=0){
      this.player2[1][x]=this.player2[0][x];
      this.player2[0][x]=0;
    }
    return;
  }
  player2_return(x){
    if(this.player2[2][x]==0&&this.player2[1][x]!=0){
      this.player2[0][x]=this.player2[1][x];
      this.player2[1][x]=0;
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
var GM=new GAME();
GM.init_game();
Page({
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
    this.setData({ cur_lun:1});
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
    GM.init_game();
  },

  back_to_init: function () {
    app.addClickAudio();
    wx.redirectTo({
      url: '/pages/game_select/game_select',
    })
  },
  player1_select_Click(event) {
    if(!this.data.player1_islock){
      app.diceClickAudio();
      const index = event.currentTarget.dataset.index;
      GM.player1_select(index);
      this.setData({player1_dice:GM.player1[0]});
      this.setData({player1_lock:GM.player1[1]});
    } 
  },
  player2_select_Click(event) {
    if(!this.data.player2_islock){
      app.diceClickAudio();
      const index = event.currentTarget.dataset.index;
      GM.player2_select(index);
      this.setData({player2_dice:GM.player2[0]});
      this.setData({player2_lock:GM.player2[1]});
    }
  },
  player1_return_Click(event) {
    if(!this.data.player1_islock){
      app.diceClickAudio();
      const index = event.currentTarget.dataset.index;
      GM.player1_return(index);
      this.setData({player1_dice:GM.player1[0]});
      this.setData({player1_lock:GM.player1[1]});
    }   
  },
  player2_return_Click(event) {
    if(!this.data.player2_islock){
      app.diceClickAudio();
      const index = event.currentTarget.dataset.index;
      GM.player2_return(index);
      this.setData({player2_dice:GM.player2[0]});
      this.setData({player2_lock:GM.player2[1]});
    }
  },
  player1_button(){
    if(!this.data.player1_islock){
      app.diceClickAudio();
      this.setData({player1_islock:!this.data.player1_islock});
      this.setData({player1_lock_text:"锁定区域(已锁)"});
      GM.player1_lock();
    }
    if(this.data.times_isOver){
      this.init_times();
    }
  },
  player2_button(){
    if(!this.data.player2_islock){
      app.diceClickAudio();
      this.setData({player2_islock:!this.data.player2_islock});
      this.setData({player2_lock_text:"锁定区域(已锁)"});
      GM.player2_lock();
    }
    if(this.data.times_isOver){
      this.init_times();
    }
  },
  player1_mult_Click(event){
    app.diceClickAudio();
    const mult = parseInt(event.currentTarget.dataset.index);
    this.setData({player1_mult:mult});
    this.setData({cur_mul:this.data.cur_mul+mult});
    if(this.data.player2_mult!=-1){
      var times=GM.role_dice();
      if(times==3){
        this.setData({player1_dice:GM.player1[0]});
        this.setData({player1_lock:GM.player1[1]});
        this.setData({player2_dice:GM.player2[0]});
        this.setData({player2_lock:GM.player2[1]});
        this.setData({cur_lun:this.data.cur_lun+1});
        setTimeout(() => {
          GM.lock_dice();
          this.init_lun();
          this.setData({times_isOver:true});
        this.times_over();
        }, 2000); 
      }else{
        this.init_lun();
      }
    }
  },
  player2_mult_Click(event){
    app.diceClickAudio();
    const mult = parseInt(event.currentTarget.dataset.index);
    this.setData({player2_mult:mult});
    this.setData({cur_mul:this.data.cur_mul+mult});
    if(this.data.player1_mult!=-1){
      var times=GM.role_dice();
      if(times==3){
        this.setData({player1_dice:GM.player1[0]});
        this.setData({player1_lock:GM.player1[1]});
        this.setData({player2_dice:GM.player2[0]});
        this.setData({player2_lock:GM.player2[1]});
        this.setData({cur_lun:this.data.cur_lun+1});
        setTimeout(() => {
          GM.lock_dice();
          this.init_lun();
          this.setData({times_isOver:true});
        this.times_over();
        }, 2000); 
      }else{
        this.init_lun();
      }
    }
  },
  init_lun(){
      this.setData({player1_mult:-1});
      this.setData({player2_mult:-1});
      this.setData({player1_islock:false});
      this.setData({player2_islock:false});
      this.setData({player1_dice:GM.player1[0]});
      this.setData({player1_lock:GM.player1[1]});
      this.setData({player2_dice:GM.player2[0]});
      this.setData({player2_lock:GM.player2[1]});
      this.setData({player1_lock_text:"锁定区域"});
      this.setData({player2_lock_text:"锁定区域"});
      if(this.data.cur_lun!=3){
        this.setData({cur_lun:this.data.cur_lun+1});
      }
  },

  times_over(){
    var player1_score=GM.player1_score();
    var player2_score=GM.player2_score();
    var play1_money=0;
    var play2_money=0;
    if(player1_score>player2_score){
      play1_money= play1_money+Math.abs(player1_score-player2_score)*this.data.cur_mul;
      play2_money=play2_money-Math.abs(player1_score-player2_score)*this.data.cur_mul;
    }else{
      play1_money= play1_money-Math.abs(player1_score-player2_score)*this.data.cur_mul;
      play2_money=play2_money+Math.abs(player1_score-player2_score)*this.data.cur_mul;
    }
    this.setData({player1_money:this.data.player1_money+play1_money});
    this.setData({player2_money:this.data.player2_money+play2_money});
  },

  init_times(){
    if(this.data.player1_money>0&&this.data.player2_money>0&&this.data.left_times>0){
      this.setData({times_isOver:false});
      GM.init_game();
      this.init_lun();
      this.setData({cur_mul:1});
      this.setData({cur_times:this.data.cur_times+1});
      this.setData({left_times:this.data.left_times-1});
      this.setData({cur_lun:1});
    }else{
      wx.redirectTo({
        url: '/pages/game_end/game_end?mode=玩家二&money1='+this.data.player1_money+'&money2='+this.data.player2_money,
      })
    }
    
  },


})