// app.js
App({
  "usingComponents": {
    "bgm": "/components/audio/audio"
  },

  globalData: {
    bgm_src: "http://music.163.com/song/media/outer/url?id=1497588709.mp3", //背景音乐地址
    bgrAudioContext: "",
    bgm_is_play: false, //背景音乐是否播放
    game_num:10,//总局数
    game_money:1000,//筹码数
    userInfo:"",
  },

  onLaunch: function () { //启动小程序执行方法
    this.createBgm(); //背景音乐
  },
  createBgm() {
    this.globalData.bgrAudioContext = wx.createInnerAudioContext();
    this.globalData.bgrAudioContext.src = this.globalData.bgm_src;
    this.globalData.bgrAudioContext.loop = true;
    this.globalData.bgm_is_play = false; 
  },
  addClickAudio: function () {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true // 是否自动开始播放，默认为 false
    innerAudioContext.loop = false // 是否循环播放，默认为 false
    wx.setInnerAudioOption({ // ios在静音状态下能够正常播放音效
        obeyMuteSwitch: false, // 是否遵循系统静音开关，默认为 true。当此参数为 false 时，即使用户打开了静音开关，也能继续发出声音。
        success: function (e) { },
        fail: function (e) { }
    })
    innerAudioContext.src = "./pages/resource/Click.mp3"; // 音频资源的地址
    innerAudioContext.onPlay()
  },
  diceClickAudio: function () {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true // 是否自动开始播放，默认为 false
    innerAudioContext.loop = false // 是否循环播放，默认为 false
    wx.setInnerAudioOption({ // ios在静音状态下能够正常播放音效
        obeyMuteSwitch: false, // 是否遵循系统静音开关，默认为 true。当此参数为 false 时，即使用户打开了静音开关，也能继续发出声音。
        success: function (e) { },
        fail: function (e) { }
    })
    innerAudioContext.src = "./pages/resource/wooden_fish.mp3"; // 音频资源的地址
    innerAudioContext.onPlay()
  },
  
})
