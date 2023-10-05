// pages/game_PVE/game_PVE.js
const app = getApp();
var current_times;
const length = 9331;

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
    this.expect = Array(9331).fill(0);
  }

  tree_push(x1, x2, x3, x4, x5, num) {
    const index = (((((0 * 6 + x1) * 6 + x2) * 6 + x3) * 6 + x4) * 6 + x5);
    this.expect[index] = num;
  }
  
  get_all_expect(depth, index) {
    if (depth >= 5) {
      return;
    }
    for (let i = 1; i <= 6; i++) {
      this.get_all_expect(depth + 1, index * 6 + i);
      this.expect[index] += this.expect[index * 6 + i];
    }
    this.expect[index] /= 6.0;
  }
  
  init_expect() {
    let a = [0, 0, 0, 0, 0];
  
    for (let i1 = 0; i1 < 6; i1++) {
      for (let i2 = 0; i2 < 6; i2++) {
        for (let i3 = 0; i3 < 6; i3++) {
          for (let i4 = 0; i4 < 6; i4++) {
            for (let i5 = 0; i5 < 6; i5++) {
              a[0] = i1 + 1;
              a[1] = i2 + 1;
              a[2] = i3 + 1;
              a[3] = i4 + 1;
              a[4] = i5 + 1;
              this.tree_push(i1 + 1, i2 + 1, i3 + 1, i4 + 1, i5 + 1, this.getScore(a));
            }
          }
        }
      }
    }
  
    this.get_all_expect(0, 0);
    this.expect[0] = this.expect[1] + this.expect[2] + this.expect[3] + this.expect[4] + this.expect[5] + this.expect[6];
    this.expect[0] /= 6.0;
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

  generateIndexCombinations(arr) {
    const indexes = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== 0) {
        indexes.push(i);
      }
    }
    const combinations = [];
    function backtrack(start, currentCombo) {
      combinations.push([...currentCombo]);
      for (let i = start; i < indexes.length; i++) {
        currentCombo.push(indexes[i]);
        backtrack(i + 1, currentCombo);
        currentCombo.pop();
      }
    }
    backtrack(0, []);
    return combinations;
  }

  calculate_expect(dice) {
    let locked_dice = Array.from(dice);
    // console.log(locked_dice);
    const l = locked_dice.length;
    let index = 0;
    for (let i = 0; i < 5; i++) {
      if(this.player2[1][i]==0){
        continue;
      }
      index *= 6;
      index += this.player2[1][i];
    }
    for (let i = 0; i < l; i++) {
      if(locked_dice[i]==0){
        continue;
      }
      index *= 6;
      index += locked_dice[i];
    }
    // console.log(this.expect[index]);
    return this.expect[index];
  }

  findMaxScoreIndexCombination(arr) {
    const indexCombinations = this.generateIndexCombinations(arr);
    let maxScore = -Infinity;
    let maxScoreIndexCombination = [];
  
    for (let i = 0; i < indexCombinations.length; i++) {
      const currentIndexCombination = indexCombinations[i];
      const lockedDice = currentIndexCombination.map(index => arr[index]);
      const score=this.calculate_expect(lockedDice);
      if (score > maxScore) {
        maxScore = score;
        maxScoreIndexCombination = currentIndexCombination;
      }
    }
    return maxScoreIndexCombination;
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

  mul_power(chips_sub, scores_sub, round_sub) {
    if (chips_sub > 0) {
        chips_sub = Math.log(Math.abs(chips_sub));
    } else if (chips_sub < 0) {
        chips_sub = -Math.log(Math.abs(chips_sub));
    }
    if (round_sub !== 0) {
        round_sub = Math.log(Math.abs(round_sub));
    }
    if (-10 <= chips_sub && chips_sub <= 10 && 0 <= round_sub && round_sub <= 10) {
        var judge = -108.79908256525293 * chips_sub + 158.38854064873104 * scores_sub + -47.57462427464868 * round_sub;
        if (judge > 100) {
            return 3;
        } else if (judge > 0) {
            return 2;
        } else if (judge > -100) {
            return 1;
        } else {
            return 0;
        }
    }
    return 0;
  }

  get_expect(dice){
    let locked_dice = Array.from(dice);
    // console.log(locked_dice);
    const l = locked_dice.length;
    let index = 0;
    for (let i = 0; i < l; i++) {
      if(locked_dice[i]==0){
        continue;
      }
      index *= 6;
      index += locked_dice[i];
    }
    // console.log(this.expect[index]);
    return this.expect[index];
  }

  getmult(chips_sub,round_sub){
    var scores_sub=this.get_expect(this.player2[1])-this.get_expect(this.player1[1]);
    var mul = this.mul_power(chips_sub,scores_sub,round_sub);
    return mul;
  }

}
var GM=new GAME();
GM.init_game();
GM.init_expect();

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
    cur_lun:1,
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
  back_to_init() {
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
  player1_return_Click(event) {
    if(!this.data.player1_islock){
      app.diceClickAudio();
      const index = event.currentTarget.dataset.index;
      GM.player1_return(index);
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
      this.player2_button();
    }
    if(this.data.times_isOver){
      this.init_times();
    }
  },
  player2_button(){
    GM.player2_lock();
    if(!this.data.player2_islock){
      this.setData({player2_islock:!this.data.player2_islock});
      this.setData({player2_lock_text:"锁定区域(已锁)"});
      this.setData({player2_dice:GM.player2[0]});
      this.setData({player2_lock:GM.player2[1]});
    }
    if(this.data.times_isOver){
      this.init_times();
    }
  },
  player1_mult_Click(event){
    app.diceClickAudio();
    this.player2_mult_Click();
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
    const mult = GM.getmult(this.data.player2_money-this.data.player1_money,this.data.left_times);
    this.setData({player2_mult:mult});
    this.setData({cur_mul:this.data.cur_mul+mult});
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
      GM.init_game();
      wx.redirectTo({
        url: '/pages/game_end/game_end?mode=人坤&money1='+this.data.player1_money+'&money2='+this.data.player2_money,
      })
    }
    
  },


})