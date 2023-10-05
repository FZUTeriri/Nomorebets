const app = getApp()
Component({
  options:{
  },
  /**
   * 组件的属性列表
   */
  properties: {
  //音频地址从父组件获取
  },

  /**
   * 组件的初始数据
   */
  data: {
    isOpen: false,//播放开关
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //播放
    tigger() {
      this.setData({
        isOpen: !this.data.isOpen
      });
      app.globalData.bgm_is_play = this.data.isOpen;
      if (!this.data.isOpen) {
          app.globalData.bgrAudioContext.pause();
      } else {
          app.globalData.bgrAudioContext.play();
      }
  },
  init() {
    var isOpen = app.globalData.bgm_is_play;
    if (app.globalData.bgm_is_play) {
      isOpen = true;
        app.globalData.bgrAudioContext.play();
    } else {
        isOpen = false;
        app.globalData.bgm_is_play = false;
        app.globalData.bgrAudioContext.pause();
    }
    this.setData({
      isOpen: isOpen
    })
  }
  },
  pageLifetimes: {
    show: function () {
        // 页面被展示
        this.init();
        console.log("页面被展示")
    },
    hide: function () {
        // 页面被隐藏
        console.log("页面被隐藏")
    },
    resize: function (size) {
        // 页面尺寸变化
        console.log("页面尺寸变化")
    }
  }
})

