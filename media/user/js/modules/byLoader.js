/**
 * Created by baiyu on 2016/8/5.
 */
var whenReady=function(){
  var funcs=[];
  var ready=false;
  var handler=function(e){
    if(ready)
      return;
    if(e.type==='onreadystatechange'&&document.readyState!=='complete'){
      return;
    }
    for(var i=0; i<funcs.length; i++){
      funcs[i].call(document);
    }
    ready=true;
    funcs=null;
  };
  //为接收到的任何事件注册处理程序
  if(document.addEventListener){
    document.addEventListener('DOMContentLoaded',handler,false);
    document.addEventListener('readystatechange',handler,false); //IE9+
    window.addEventListener('load',handler,false);
  }
  else if(document.attachEvent){
    document.attachEvent('onreadystatechange',handler);
    window.attachEvent('onload',handler);
  }
  return function(fn){
    if(ready){
      fn.call(document);
    }
    else{
      funcs.push(fn);
    }
  }
}();
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
whenReady(function(){
  var allScript=document.getElementsByTagName("script");
  var thisScript=null;
  var dataJs=[],dataCss=[];
  var baseDir="";
  for(var i=0; i<allScript.length; i++){
    if(allScript[i].getAttribute("src")&&allScript[i].getAttribute("src").indexOf("byLoader")>=0) thisScript=allScript[i];
  }
  if(thisScript!=null&&console.log&&thisScript.getAttribute("src").indexOf("byLoader.min")<0) var reLog=true;
  if(thisScript===null&&reLog){
    console.log("错误提示:程序未成功执行,请支持原创,插件名称不要改动.如有问题请访问:https://github.com/baiyukey/byLoader");
    return false;
  }
  if(!thisScript.getAttribute("data-base-dir")&&console.log){
    console.log('友情提示:由于"data-base-dir"的值为空,byLoader已停止执行.');
    //return false;
  }
  else{
    baseDir=thisScript.getAttribute("data-base-dir");
  }
  if(!thisScript.getAttribute("data-css")&&reLog){
    console.log('友情提示:"data-css"的值为空.');
  }
  else{
    dataCss=thisScript.getAttribute("data-css").split(",");
  }
  if(!thisScript.getAttribute("data-js")&&reLog){
    console.log('友情提示:"data-js"的值为空.');
  }
  else{
    dataJs=thisScript.getAttribute("data-js").split(",");
  }
  var staticDir=location.pathname.split("/")[1]=="static" ? "/static" : "/";
  var modDir=location.pathname.replace(staticDir,"").replace(".html","");
  var jsMode="modules/"+modDir;
  var min=/^((192\.168|172\.([1][6-9]|[2]\d|3[01]))(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}|10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3})|(localhost)$/.test(window.location.hostname) ? "" : ".min";
  var thisVersion=min==="" ? ""+new Date().getTime() : ""+new Date().getMonth()+new Date().getDate()+Math.ceil((new Date().getHours()+1)/2);
  window.byLoader=function(){
    var loadJs=function(name,url,callback){
      if(window.localStorage){
        var xhr;
        var js=localStorage.getItem(name);
        if(js==null||js.length==0||thisVersion!=localStorage.getItem("version")){
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
                writeJs(name,js);
                if(callback!=null){
                  callback(); //回调，执行下一个引用  
                }
              }
            };
          }
        }
        else{
          writeJs(name,js);
          if(callback!=null){
            callback();  //回调，执行下一个引用  
          }
        }
      }
      else{
        linkJs(url+".js");
      }
    };
    var loadCss=function(name,url,callback){
      if(window.localStorage){
        var xhr;
        var css=localStorage.getItem(name);
        if(css==null||css.length==0||thisVersion!=localStorage.getItem("version")){
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
                css=css.replace(/\/byAdmin\/media\/user\//g,baseDir); //byAdmin中的css文件的图片路径需单独处理  
                localStorage.setItem(name,css);
                writeCss(name,css);
                if(callback!=null){
                  callback(); //回调，执行下一个引用  
                }
              }
            };
          }
        }
        else{
          //css=css.replace(/\/byAdmin\/media\/user\//g,baseDir); //css里的图片路径需单独处理  
          writeCss(name,css);
          if(callback!=null){
            callback(); //回调，执行下一个引用  
          }
        }
      }
      else{
        linkCss(url+".css");
      }
    };//往页面写入js脚本  
    var writeJs=function(name,text){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("script");
      link.setAttribute("type","text/javascript");
      link.setAttribute("data-name",name);
      if(name.indexOf("require")>0){
        /* link.defer=true;
         link.async=true;*/
        link.setAttribute("data-main",baseDir+"js/"+jsMode+min);
      }
      link.innerHTML=text;
      head.appendChild(link);
    };//往页面写入js脚本  
    var writeCss=function(name,text){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("style");
      link.setAttribute("type","text/css");
      link.setAttribute("data-name",name);
      link.innerHTML=text;
      head.appendChild(link);
    };//往页面引入css脚本  
    var linkJs=function(url){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("script");
      //link.type="text/javascript";
      if(url.indexOf("require.js")>0){
        //link.defer=true;
        //link.async=true;
        link.setAttribute("data-main",baseDir+"js/"+jsMode+min);
      }
      link.src=url;
      head.appendChild(link);
    };//往页面引入css样式  
    var linkCss=function(url){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("link");
      link.type="text/css";
      link.rel="stylesheet";
      link.rev="stylesheet";
      link.media="screen";
      link.href=url;
      head.appendChild(link);
    };
    var loadSort=function(_baseUrl,_modules,_type,callBack){
      var baseUrl=_baseUrl;
      var modules=_modules.removeRepeat();
      var fileType=_type.toUpperCase();
      //if(navigator.appName==="Microsoft Internet Explorer"&&parseInt(navigator.appVersion.split(";")[1].replace("MSIE",""))<9&&fileType==="JS" ) modules.splice(0,0,"html5shiv");//IE版本小于9
      var i=-1;
      var per=function(){
        i++;
        if(i>=modules.length){
          if(typeof(callBack)!="undefined") callBack.call(this);
          return false;
        }
        else{
          if(fileType==="JS") loadJs(modules[i],baseUrl+modules[i],per);
          if(fileType==="CSS") loadCss(modules[i],baseUrl+modules[i],per);
        }
      };
      per();
    };
    var setVersion=function(){
      localStorage.setItem("version",thisVersion);
    };
    this.cssSort=[];
    this.jsSort=[];
    this.run=function(){
      //execute({"callBack":setVersion});
      this.cssSort.push(modDir);//外部命令加载时页面CSS模块放到最后提升优先级
      loadSort(baseDir+"css/",this.cssSort,"css");
      loadSort(baseDir+"js/",this.jsSort,"js",setVersion);
    };
  };
  dataCss.push(modDir);
  if(dataJs.indexOf("require")<0) dataJs.push(jsMode);
  var thisLoader=new byLoader();
  thisLoader.cssSort=dataCss;
  thisLoader.jsSort=dataJs;
  thisLoader.run();
});