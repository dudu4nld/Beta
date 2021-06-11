var app = getApp();
var date;
var allowlog = 1;
var Bmob = require('../../utils/bmob.js');
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
   newList: [],
  },
  getSetting:function(){ //获取用户的当前设置
    const _this = this;
    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true)                     {
          //未授权
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                //取消授权
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                //确定授权，通过wx.openSetting发起授权请求
                wx.openSetting({
                  success: function (res) {
                    if (res.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      _this.goAddress();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //用户首次进入页面,调用wx.getLocation的API
          _this.goAddress();
        }
        else {
          // console.log('授权成功')
          //调用wx.getLocation的API
          _this.goAddress();
        }
      }
    })
  },
  btn_click: function(e){
    if (allowlog == 1){
      allowlog = 0;
      wx.getStorage({
        key: 'user_id',
        success: function (res) {
          var user_id = new Bmob.User();
          user_id.id = res.data;
          wx.getStorage({
            key: 'my_nick',
            success: function (ress) {
              var mydate = new Date();
              var year = mydate.getFullYear();
              var month = mydate.getMonth() + 1;
              var day = mydate.getDate();
              var date = year + "年" + month + "月" + day + "日";
              var hour = mydate.getHours(); //获取当前小时数(0-23)
              var minute = mydate.getMinutes(); //获取当前分钟数(0-59)
              var second = mydate.getSeconds(); //获取当前秒数(0-59)
              var time = hour + "时" + minute + "分" + second + "秒";
              var avatar = wx.getStorageSync("my_avatar");
              var Punch = Bmob.Object.extend("punch");
              var punch = new Punch();
              var me = ress.data;
              console.log(date);
              var query = new Bmob.Query(Punch);
              query.equalTo("nickname", me);
              query.equalTo("date", date);
              // 查询所有数据
              query.find({
                success: function (results) {
                  console.log("共查询到 " + results.length + " 条记录");
                  if (results.length == 0) {
                    if (hour >= 6) {
                      if (hour  <24) {
                        var intger;
                        intger=3;
                        wx.showToast({
                          title: '打卡成功+' + intger + "分",
                          icon: 'success'
                        })
                        console.log(intger);
                        wx.getStorage({
                          key: 'my_username',
                          success: function (ress) {
                            if (ress.data) {
                              var my_username = ress.data;
                              wx.getStorage({
                                key: 'user_openid',
                                success: function (openid) {
                                  var openid = openid.data;
                                  var user = Bmob.User.logIn(my_username, openid, {
                                    success: function (users) {
                                      var score = users.get('score');
                                      score = score + intger;
                                      users.set('score', score);
                                      users.save(null, {
                                        success: function (user) {
                                        },
                                        error: function (error) {
                                          console.log(error)
                                        }
                                      });
                                    }
                                  });
                                }, function(error) {
                                  console.log(error);
                                }
                              })
                            }

                          }
                        })
                        punch.set('nickname', me);
                        punch.set('user_id', user_id);
                        punch.set('date', date);
                        punch.set('avatar', avatar)
                        punch.set('time', time);
                        console.log(me, user_id);
                        punch.save(null, {
                          success: function (result) {
                            console.log('success');
                            allowlog = 1;

                          },
                          error: function (result, error) {
                            console.log(result, error, "failure")
                          }
                        })
                      }
                  
                    }
                    else {
                      wx.showToast({
                        title: '还没到打卡时间',
                        icon: 'loading'
                      })
                    }


                  }
                  else {
                    allowlog = 1;
                    wx.showToast({
                      icon: 'none',
                      title: '今日已打卡过',
                      icon: 'success'
                    })
                  }
                },
                error: function (error) {
                  console.log("查询失败");
                }
              });
            }
          })

        },
      })
    }
    else{
      wx.showToast({
        title: '点的太快了',
        icon: 'loading'
      })
    }
    
  },
  btn_click2: function(e){
    wx.getStorage({
      key: 'my_username',
      success: function (ress) {
        if (ress.data) {
          var my_username = ress.data;
          wx.getStorage({
            key: 'user_openid',
            success: function (openid) {
              var openid = openid.data;
              var user = Bmob.User.logIn(my_username, openid, {
                success: function (users) {
                  var score = users.get('score');
                  wx.showToast({
                    title:  '已坚持打卡'+score/3+'天',
                    duration: 2100,
                  })
                }
              });
            }, function(error) {
              console.log(error);
            }
          })
        }

      }
    })

  },
  tempData: function () {
    var that = this;
    var Punch = Bmob.Object.extend("punch");
    var query = new Bmob.Query(Punch);
    var mydate = new Date();
    var year = mydate.getFullYear();
    var month = mydate.getMonth() + 1;
    var day = mydate.getDate();
    var date = year + "年" + month + "月" + day + "日";
    query.equalTo("date", date);
    query.limit(100);
    var results = [];
    query.find({
      success: function (result) {
        for (var i = 0; i < result.length; i++) {
          console.log('共有打卡记录:', result.length)
          var object = result[i];
          object.set('time', object.createdAt.substring(11, 19));
          object.set('rank', i + 1);
          results[i] = object;
        }
        console.log(results);
        that.setData({
          list: results,
          times: date
        });
      }
    })

  },
  onLoad: function () {
    this.tempData();
  },
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
 
  },
 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
 
  },
 
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
 
  },
 

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.tempData();
    wx.stopPullDownRefresh();
  },

  onShareAppMessage: function () {
    return {
      title: '快来图书馆一起学习打卡',
      imageUrl: '../../static/images/logo.png'
    }
  },
 
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
 
  }
})
 
 