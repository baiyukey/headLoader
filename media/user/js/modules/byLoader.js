/**
 * Created by baiyu on 2016/8/5.
 */
window.onload=function(){
  var allScript=document.getElementsByTagName("script");
  var thisScript=null;
  var jsSort=[],cssSort=[];
  var mediaDir="";
  for(var i=0; i<allScript.length; i++){
    thisScript=allScript[i].getAttribute("src").indexOf("byLoader")>=0 ? allScript[i] : null;
  }
  if(thisScript===null&&console.log){
    console.log("byLoader没有指定data-media属性.");
    return false;
  }
  if(!thisScript.getAttribute("data-media-dir")&&console.log){
    console.log("byLoader没有指定data-media属性.");
    return false;
  }
  else{
    mediaDir=thisScript.getAttribute("data-media-dir");
  }
  if(!thisScript.getAttribute("data-css")&&thisScript["src"].indexOf("byLoader")>=0&&console.log){
    console.log("byLoader没有指定data-css属性.");
  }
  else{
    cssSort=thisScript.getAttribute("data-css").split(",");
  }
  if(!thisScript.getAttribute("data-js")&&thisScript["src"].indexOf("byLoader")>0&&console.log){
    console.log("byLoader没有指定data-js属性.");
  }
  else{
    jsSort=thisScript.getAttribute("data-js").split(",");
  }
  var staticDir=location.pathname.split("/")[1]=="static" ? "/static" : "/";
  var modDir=location.pathname.replace(staticDir,"").replace(".html","");
  var jsMode="modules/"+modDir;
  window.min=/^((192\.168|172\.([1][6-9]|[2]\d|3[01]))(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}|10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3})|(localhost)$/.test(window.location.hostname) ? "" : ".min";
  Array.prototype.removeRepeat=function(){
    var thisArr=this;
    var reArr=[];
    var temp={};
    for(var i=0; i<thisArr.length; i++){
      if(!temp[thisArr[i]]){
        reArr.push(thisArr[i]);
        temp[thisArr[i]]=true;
      }
    }
    return reArr;
  };//数组去重
  window.byLoader={
    loadJs:function(name,url,callback){
      if(window.localStorage){
        var xhr;
        var js=localStorage.getItem(name);
        if(js==null||js.length==0||byLoader.reVersion()!=localStorage.getItem("version")){
          if(window.XMLHttpRequest){
            xhr=new XMLHttpRequest();
          }
          else if(window.ActiveXObject){
            xhr=new ActiveXObject("Microsoft.XMLHTTP");
          }
          if(xhr!=null){
            xhr.open("GET",url+".js");
            xhr.send(null);
            xhr.onreadystatechange=function(){
              if(xhr.readyState==4&&xhr.status==200){
                js=xhr.responseText;
                localStorage.setItem(name,js);
                js=js==null ? "" : js;
                byLoader.writeJs(name,js);
                if(callback!=null){
                  callback(); //回调，执行下一个引用  
                }
              }
            };
          }
        }
        else{
          byLoader.writeJs(name,js);
          if(callback!=null){
            callback();  //回调，执行下一个引用  
          }
        }
      }
      else{
        byLoader.linkJs(url+".js");
      }
    },
    loadCss:function(name,url,callback){
      if(window.localStorage){
        var xhr;
        var css=localStorage.getItem(name);
        if(css==null||css.length==0||byLoader.reVersion()!=localStorage.getItem("version")){
          if(window.XMLHttpRequest){
            xhr=new XMLHttpRequest();
          }
          else if(window.ActiveXObject){
            xhr=new ActiveXObject("Microsoft.XMLHTTP");
          }
          if(xhr!=null){
            xhr.open("GET",url+".css");
            xhr.send(null);
            xhr.onreadystatechange=function(){
              if(xhr.readyState==4&&xhr.status==200){
                css=xhr.responseText;
                css=css==null ? "" : css;
                css=css.replace(/\/byAdmin\/media\/user\//g,mediaDir); //byAdmin中的css文件的图片路径需单独处理  
                localStorage.setItem(name,css);
                byLoader.writeCss(name,css);
                if(callback!=null){
                  callback(); //回调，执行下一个引用  
                }
              }
            };
          }
        }
        else{
          //css=css.replace(/\/byAdmin\/media\/user\//g,mediaDir); //css里的图片路径需单独处理  
          byLoader.writeCss(name,css);
          if(callback!=null){
            callback(); //回调，执行下一个引用  
          }
        }
      }
      else{
        byLoader.linkCss(url+".css");
      }
    },//往页面写入js脚本  
    writeJs:function(name,text){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("script");
      link.setAttribute("type","text/javascript");
      link.setAttribute("data-name",name);
      if(name.indexOf("require")>0){
        /* link.defer=true;
         link.async=true;*/
        link.setAttribute("data-main",mediaDir+"js/"+jsMode+window.min);
      }
      link.innerHTML=text;
      head.appendChild(link);
    },//往页面写入js脚本  
    writeCss:function(name,text){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("style");
      link.setAttribute("type","text/css");
      link.setAttribute("data-name",name);
      link.innerHTML=text;
      head.appendChild(link);
    },//往页面引入css脚本  
    linkJs:function(url){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("script");
      //link.type="text/javascript";
      if(url.indexOf("require.js")>0){
        //link.defer=true;
        //link.async=true;
        link.setAttribute("data-main",mediaDir+"js/"+jsMode+window.min);
      }
      link.src=url;
      head.appendChild(link);
    },//往页面引入css样式  
    linkCss:function(url){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("link");
      link.type="text/css";
      link.rel="stylesheet";
      link.rev="stylesheet";
      link.media="screen";
      link.href=url;
      head.appendChild(link);
    },
    loadSort:function(_baseUrl,_modules,_type){
      var i=-1;
      var baseUrl=_baseUrl;
      var modules=_modules.removeRepeat();
      var fileType=_type.toUpperCase();
      
      function execute(_obj){
        var obj=typeof(_obj)!="undefined" ? _obj : {};
        var per=function(){
          i++;
          if(i>=modules.length){
            if(typeof(obj.callBack)!="undefined") obj.callBack.call(this);
            return false;
          }
          else{
            if(fileType==="JS") byLoader.loadJs(modules[i],baseUrl+modules[i],per);
            if(fileType==="CSS") byLoader.loadCss(modules[i],baseUrl+modules[i],per);
          }
        };
        per();
      }
      
      this.execute=execute;
    },
    reVersion:function(){return window.min==="" ? ""+new Date().getTime() : ""+new Date().getMonth()+new Date().getDate()+Math.ceil((new Date().getHours()+1)/2);},
    setVersion:function(){
      localStorage.setItem("version",byLoader.reVersion());
    }
  };
  var init=function(){
    cssSort.push(modDir);
    if(jsSort.indexOf("require")<0) jsSort.push(jsMode);
    //if(navigator.appName==="Microsoft Internet Explorer"&&parseInt(navigator.appVersion.split(";")[1].replace("MSIE",""))<9) jsSort.splice(0,0,"html5shiv");//IE版本小于9
    var loadCssSort=new byLoader.loadSort(mediaDir+"css/",cssSort,"css");
    var loadJsSort=new byLoader.loadSort(mediaDir+"js/",jsSort,"js");
    var loadCssCallback=function(){
      loadJsSort.execute({"callBack":byLoader.setVersion});
    };
    loadCssSort.execute({"callBack":loadCssCallback});
  };
  init();
};