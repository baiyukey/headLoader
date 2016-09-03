/**
 * Created by baiyu on 2012/9/1.
 * version:0.5.4
 */
$(function(){
  $.fn.extend({
    "byAlert":function(val){
      val=$.extend({
        "fadeTime":300,
        "mark":true,
        "markOpacity":0.15,
        "markColor":"#FFF",
        "callBack":false,
        "callBackArr":null,
        "closeBtn":true,
        "animate":100
      },val);
      var $window,$document;
      $window=$(window.top);
      $document=$(window.top.document);
/*      if(window===window.top){
        $window=$(window.top);
        $document=$(window.top.document);
      }
      else{
        $window=$(window);
        $document=$(document);
      }*/
      var $alertCont=$(this);
      if($alertCont.length===0){
        alert("对象未找到");
        return false;
      }
      var alertTitHeight=0;
      var alertId=(Math.random()*1000).toFixed(0);
      var alertContOuterWidth=$alertCont.outerWidth();
      var alertContOuterHeight=$alertCont.outerHeight();
      var alertContHeight=$alertCont.height();
      var alertContDisplay=$alertCont.css("display");
      if(alertContOuterHeight>$document.height()){
        alertContHeight=$document.height()-(alertContOuterHeight-alertContHeight);
        alertContOuterHeight=$document.height();
      }
      var bodyMarkId="bodyMark_"+alertId;
      var disableMarkId="disableMark_"+alertId;
      var showPanelId="showPanel_"+alertId;
      var recordPlaceId="recordPlace_"+alertId;
      var closeBtnId="closeBtn_"+alertId;
      var bodyMarkHtml='<div id="'+bodyMarkId+'" class="bodyMark" style="position:absolute; width:'+$document.width()+'px; height:'+$document.height()+'px; z-index:888888; left:0; top:0; background:'+val.markColor+'; display:none;_position:absolute;_height:'+$document.outerHeight()+';"></div>';
      var showPanelHtml='<div id="'+showPanelId+'" data-fadetime="'+val.fadeTime+'" data-hisdisplay="'+alertContDisplay+'" class="showPanel" style="display:none; width:'+alertContOuterWidth+'px; height:'+alertContOuterHeight+'px; position:absolute;_position:absolute; left:0; top:0;"><a href="#" id="'+closeBtnId+'" class="byAlertClose" title="关闭" style="position:absolute; right:0; top:0; display:block; z-index:1;"></a><div class="byAlertCont" style="position:absolute;padding:0;"></div></div><div id="'+disableMarkId+'" class="disableMark" style="position:absolute; display:none; width:'+$document.width()+'px; height:'+$document.height()+'px; z-index:999999; left:0; top:0; background:#ffffff;_position:absolute;_height:'+$document.outerHeight()+';"></div>';
      $document.find("body").append(bodyMarkHtml+showPanelHtml);
      $alertCont.before('<div id="'+recordPlaceId+'" style="display:none;"></div>');
      var $bodyMark=$document.find("#"+bodyMarkId);
      var $showPanel=$document.find("#"+showPanelId);
      var $disableMark=$document.find("#"+disableMarkId);
      var $recordPlace=$alertCont.closest("body").find("#"+recordPlaceId);
      var getShowPanelXy=function(){
        var alertX=($document.width()-alertContOuterWidth)*0.5;
        var alertY=0;
        if(($document.scrollTop()+alertContOuterHeight)>$document.height()){
          alertY=$document.height()-alertContOuterHeight;
        }
        else{
          alertY=$document.scrollTop()+(($window.height()-alertContOuterHeight)*0.4);
          alertY<$document.scrollTop() ? alertY=$document.scrollTop() : null;
        }
        alertY<0 ? alertY=0 : null;
        this.alertX=alertX;
        this.alertY=alertY;
      };
      var convertZ=function(){
        $document.find(".showPanel").css({"z-index":999996});
        $(this).closest(".showPanel").css({"z-index":999997});
      };
      var showPanelLoaded=function(){
        $disableMark.hide();
        $alertCont.find("div.alertTit").length>0 ? alertTitHeight=$alertCont.find(".alertTit").outerHeight() : null;//如果弹出中包含div.alertTit
        if($showPanel.find("div.alertCont").length>0){
          var $thisCont=$showPanel.find("div.alertCont");
          $thisCont.css({
            "height":(alertContHeight-parseInt($thisCont.css("padding-top"))-parseInt($thisCont.css("padding-bottom"))-alertTitHeight),
            "overflow-y":"auto"
          });
        }//如果弹出中包含div.alertCont
/*        if(typeof($window[0].onresize)==="function"&&$window[0].onresize.name!=="fixMarkSize"){
          $window[0].oldOnresize=$window[0].onresize;//oldOnresize永远不可能是fixMarkSize
        }
        $window[0].onresize=fixMarkSize;*/
        fixMarkSize();
        val.callBack&&typeof(val.callBack)==="function" ? val.callBack.call(this,val.callBackArr) : null;
        $showPanel.find("input[type='text']:visible").length>0 ? $showPanel.find("input[type='text']:visible:eq(0)").focus() : $showPanel.find("textarea:eq(0)").focus();
      };
      var fixMarkSize=function(){
        $document.find(".bodyMark").css({
          "width":$window.width(),
          "height":$document.height()
        });
        $document.find(".disableMark").css({
          "width":$window.width(),
          "height":$document.height()
        });
        $window[0].oldOnresize ? $window[0].oldOnresize.call(this) : null;
      };
      var showAlert=function(){
        $alertCont.show().insertBefore($showPanel.find("div.byAlertCont"));
        var panelXy=new getShowPanelXy();
        $disableMark.css({
          "opacity":"0.01",
          "display":"block"
        });
        $showPanel.css({
          "left":panelXy.alertX,
          "top":(panelXy.alertY-val.animate),
          "z-index":999998,
          "opacity":"0.1",
          "display":"block"
        }).stop(true,false).animate({
          "top":(panelXy.alertY),
          "opacity":"1"
        },val.fadeTime);
        setTimeout(showPanelLoaded,val.fadeTime);
      };
      var exitAlert=function(event){
        event.preventDefault();
        var clearThis=function(){
          if($(("#"+recordPlaceId)).length===0){
            $($document[0].getElementsByTagName('iframe')[0].contentWindow.document).find("#"+recordPlaceId).after($showPanel.find($alertCont).css({"display":alertContDisplay}));
          }
          else{
            $("#"+recordPlaceId).after($showPanel.find($alertCont).css({"display":alertContDisplay}));
          }
          $recordPlace.after($showPanel.find($alertCont).css({"display":alertContDisplay}));
          $recordPlace.remove();
          $showPanel.remove();
          $disableMark.remove();
          if($document.find(".bodyMark.wantShow").length>1){
            $bodyMark.siblings(".bodyMark.wantShow:eq(0)").show();
            $bodyMark.stop(true,false).remove();
          }
          else if($document.find(".bodyMark.wantShow").length===1){
            $bodyMark.stop(true,false);
            if($bodyMark.hasClass("wantShow")){
              $bodyMark.fadeOut(val.fadeTime,function(){$bodyMark.remove()});
            }
            else{
              $bodyMark.stop(true,false).remove();
            }
          }
          else{
            $bodyMark.stop(true,false).remove();
          }
/*          if($document.find(".showPanel:visible").length===0){
            if(typeof($window[0].oldOnresize)==="function"){
              $window[0].onresize=$window[0].oldOnresize ? $window[0].oldOnresize : null;
              $window[0].oldOnresize=undefined;
            }
            else{
              $window[0].onresize=null;
            }
          }*/
        };
        $disableMark.show();
        $showPanel.off("click","#"+closeBtnId);
        $showPanel.stop(true,false).animate({
          "top":($showPanel.offset().top-val.animate),
          "opacity":0
        },val.fadeTime).fadeOut(0,clearThis);
      };
      if(val.closeBtn===false) $document.find("#"+closeBtnId).hide();
      if(val.mark){
        $bodyMark.addClass("wantShow").css("opacity",val.markOpacity);
        if($document.find(".bodyMark.wantShow").length===1){
          $document.find(".bodyMark.wantShow").eq(0).fadeIn(300,showAlert);
        }
        else if($document.find(".bodyMark.wantShow").length>1){
          $document.find(".bodyMark.wantShow").eq(0).fadeIn(0,showAlert).siblings(".bodyMark.wantShow").hide();
        }
        else{
          showAlert();
        }
      }
      else{
        showAlert();
      }
      $showPanel.on("click","#"+closeBtnId,exitAlert);
      $showPanel.on("click","a.cancel",exitAlert);
      $showPanel.find(".alertTit").off("mousedown");
      $showPanel.on("mousedown",".alertTit",function(event){
        //with($showPanel){
        var baseX,baseY,eX,eY,bodyW,bodyH,moveX,moveY;
        baseX=$showPanel.offset().left;
        baseY=$showPanel.offset().top;
        eX=event.pageX;
        eY=event.pageY;
        bodyW=$showPanel.closest("body").width();
        bodyH=$showPanel.closest("body").height();
        var moveThis=function(e){
          moveX=e.pageX-eX+baseX;
          moveY=e.pageY-eY+baseY;
          if(moveX<=0) return false;
          if(moveX>=(bodyW-$showPanel.width()))return false;
          if(moveY<=0) return false;
          if(moveY>=(bodyH-$showPanel.height()))return false;
          $showPanel.css({
            "left":moveX,
            "top":moveY
          });
        };
        $showPanel.css({"cursor":"move"});
        $showPanel.closest("body").css({
          "-moz-user-select":"none",
          "-webkit-user-select":"none",
          "-ms-user-select":"none",
          "-khtml-user-select":"none",
          "user-select":"none"
        });
        $document.off("mousemove").on("mousemove",$showPanel,moveThis);
        $document.off("mouseup").on("mouseup",$showPanel.find(".alertTit:eq(0)"),function(){
          $document.off("mousemove");
          $showPanel.css({"cursor":""});
          $showPanel.closest("body").css({
            "-moz-user-select":"",
            "-webkit-user-select":"",
            "-ms-user-select":"",
            "-khtml-user-select":"",
            "user-select":""
          });
        });
      });
      $showPanel.on("mousedown",this,convertZ);
      //$showPanel.on("click","input.cancel",exitAlert);//如果有取消按钮
      return $alertCont;
    },
    "byAlertExit":function(val){
      var $this=$(this);
      var showPanelId=$this.closest(".showPanel").attr("id");
      var thisOpacity=$("#"+showPanelId).css("opacity");
      //var $window,$document;
      //$window=$(window.top);
      var $document=$(window.top.document);
     /* if(window===window.top){
        $window=$(window.top);
        $document=$(window.top.document);
      }
      else{
        $window=$(window);
        $document=$(document);
      }*/
      val=$.extend({
        "fadeTime":parseInt($document.find("#"+showPanelId).attr("data-fadetime")),
        "callBack":false,
        "callBackArr":null,
        "animate":100
      },val);
      var checkSuccess=function(){
        if($document.find("#"+showPanelId).length===1&&$document.find("#"+showPanelId).css("opacity")===thisOpacity){
          var thisId=showPanelId.replace("showPanel","");
          var alertContDisplay=$document.find("#"+showPanelId).attr("data-hisdisplay");
          var $recordPlace=$("#recordPlace"+thisId);
          var clearThis=function(){
            if($recordPlace.length===0){
              $($document[0].getElementsByTagName('iframe')[0].contentWindow.document).find("#recordPlace"+thisId).after($("#showPanel"+thisId).find($this).css({"display":alertContDisplay}));
              $($document[0].getElementsByTagName('iframe')[0].contentWindow.document).find("#recordPlace"+thisId).remove();
            }
            else{
              $recordPlace.after($("#showPanel"+thisId).find($this).css({"display":alertContDisplay}));
              $recordPlace.remove();
            }
            $document.find("#disableMark"+thisId).remove();
            $document.find("#showPanel"+thisId).remove();
            if($document.find(".bodyMark.wantShow").length>1){
              $document.find("#bodyMark"+thisId).siblings(".bodyMark.wantShow:eq(0)").show();
              $document.find("#bodyMark"+thisId).stop(true,false).remove();
            }
            else if($document.find(".bodyMark.wantShow").length===1){
              if($document.find("#bodyMark"+thisId).hasClass("wantShow")){
                $document.find("#bodyMark"+thisId).stop(true,false);
                $document.find("#bodyMark"+thisId).fadeOut(val.fadeTime,function(){$document.find("#bodyMark"+thisId).remove()});
              }
              else{
                $document.find("#bodyMark"+thisId).stop(true,false).remove();
              }
            }
            else{
              $document.find("#bodyMark"+thisId).stop(true,false).remove();
            }
/*            if($document.find(".showPanel:visible").length===0){
              if(typeof($window[0].oldOnresize)==="function"){
                $window[0].onresize=$window[0].oldOnresize ? $window[0].oldOnresize : null;
                $window[0].oldOnresize=undefined;
              }
            }*/
            val.callBack&&typeof(val.callBack)==="function" ? val.callBack.call(this,val.callBackArr) : null;
          };
          $document.find("#showPanel"+thisId).stop(true,false).animate({
            "top":($document.find("#showPanel"+thisId).offset().top-val.animate),
            "opacity":0
          },val.fadeTime).fadeOut(0,clearThis);
        }//未成功退出的强制退出
        else{
          val.callBack&&typeof(val.callBack)==="function" ? val.callBack.call(this,val.callBackArr) : null;
        }
      };
      $this.closest(".showPanel").find("a.byAlertClose").trigger("click");
      setTimeout(checkSuccess,val.fadeTime);
      return $(this);
    }
  });}
);