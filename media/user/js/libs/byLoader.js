﻿/* 
 see: https://github.com/baiyukey/byLoader for details
 */
;(function(){
  var removeRepeat=function(_this){
    var thisArr=_this;
    var reArr=[];
    var temp={};
    for(var i=0; i<thisArr.length; i++){
      if(!temp[thisArr[i]]){
        reArr.push(thisArr[i]);
        temp[thisArr[i]]=true;
      }
    }
    return reArr;
  };
  var removeEmpty=function(_this){
    var reArr=[];
    for(var i=0; i<_this.length; i++){
      if(_this[i].length!=0){
        reArr.push(_this[i]);
      }
    }
    return reArr;
  };
  var allScript=document.getElementsByTagName("script");
  var thisScript=null;
  var dataJs=[],dataCss=[];
  var baseDir="";
  var update=false;
  for(var i=0; i<allScript.length; i++){
    if(allScript[i].hasAttribute("src")&&allScript[i].getAttribute("src").indexOf(atob("YnlMb2FkZXIu"))>=0) thisScript=allScript[i];
  }
  if(thisScript===null){
    if(console.log) console.log("%c"+decodeURIComponent(atob("JUU5JTk0JTk5JUU4JUFGJUFGJUU2JThGJTkwJUU3JUE0JUJBJTNBJUU3JUE4JThCJUU1JUJBJThGJUU2JTlDJUFBJUU2JTg4JTkwJUU1JThBJTlGJUU2JTg5JUE3JUU4JUExJThDJTJDJUU2JThGJTkyJUU0JUJCJUI2JUU1JTkwJThEJUU3JUE3JUIwJUU0JUI4JUJBYnlMb2FkZXIuanMlRTYlODglOTYlRTglODAlODVieUxvYWRlci5taW4uanMlRTYlQjMlQTglRTYlODQlOEYlRTUlQTQlQTclRTUlQjAlOEYlRTUlODYlOTkuJUU1JUE2JTgyJUU2JTlDJTg5JUU3JTk2JTkxJUU5JTk3JUFFJUU4JUFGJUI3JUU4JUFFJUJGJUU5JTk3JUFFJTNBaHR0cHMlM0ElMkYlMkZnaXRodWIuY29tJTJGYmFpeXVrZXklMkZieUxvYWRlcg==")),"color:#F00");
    return false;
  }
  var reLog=console.log&&thisScript.getAttribute("src").indexOf(".min")<0;
  var staticDir=location.pathname.split("/")[1]=="static" ? "/static" : "/";
  var modDir=location.pathname.replace(staticDir,"").replace(".html","");
  modDir=modDir.indexOf("/")===0 ? modDir.substr(1) : modDir;
  if(thisScript.hasAttribute("data-update-version")){
    update=thisScript.getAttribute("data-update-version");
  }
  else{
    if(reLog) console.log('%c友情提示:script标签无"data-update-version"属性,默认为false.',"color:#69F;");
  }
  if(thisScript.hasAttribute("data-dir")){
    baseDir=thisScript.getAttribute("data-dir");
  }
  else{
    if(reLog) console.log('%c友情提示:script标签无"data-dir"属性.',"color:#69F;");
  }
  if(thisScript.hasAttribute("data-css")){
    dataCss=thisScript.getAttribute("data-css").split(",");//.replace(/_css/g,modDir);
    //dataCss.push(modDir);
  }
  else{
    if(reLog) console.log('%c友情提示:script标签无"data-css"属性',"color:#69F;");
  }
  if(thisScript.hasAttribute("data-js")){
    dataJs=thisScript.getAttribute("data-js").split(",");//.replace(/_js/g,modDir);
    //if(thisScript.getAttribute("data-js").indexOf("require")<0) dataJs.push(modDir);
  }
  else{
    if(reLog) console.log('%c友情提示:script标签无"data-js"属性',"color:#69F;");
  }
  window.byLoader=function(_val){
    var min=/^((192\.168|172\.([1][6-9]|[2]\d|3[01]))(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}|10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3})|(localhost)$/.test(window.location.hostname) ? "" : ".min";
    var priVersion=localStorage.getItem("byLoadDataVersion");
    var thisVersion="";
    var loadJs=function(_thisDir,callback){
      var name=_thisDir;
      var url=_thisDir+".js?"+returnVersion();
      if(window.localStorage){
        var xhr;
        var js=localStorage.getItem(name);
        if(js==null||js.length==0||thisVersion!=priVersion){
          if(window.XMLHttpRequest){
            xhr=new XMLHttpRequest();
          }
          else if(window.ActiveXObject){
            xhr=new ActiveXObject("Microsoft.XMLHTTP");
          }
          if(xhr!=null){
            xhr.open("GET",url);
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
        linkJs(url);
      }
    };//加载js
    var loadCss=function(_url,callback){
      var name=_url;
      var url=_url+".css?"+returnVersion();
      if(window.localStorage){
        var xhr;
        var css=localStorage.getItem(name);
        if(css==null||css.length==0||thisVersion!=priVersion){
          if(window.XMLHttpRequest){
            xhr=new XMLHttpRequest();
          }
          else if(window.ActiveXObject){
            xhr=new ActiveXObject("Microsoft.XMLHTTP");
          }
          if(xhr!=null){
            xhr.open("GET",url);
            xhr.send(null);
            xhr.onreadystatechange=function(){
              if(xhr.readyState==4&&xhr.status==200){
                css=xhr.responseText;
                css=css==null ? "" : css;
                css=css.replace(/\[dataDir]/g,baseDir); //css文件的动态路径需单独处理  
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
          //css=css.replace(/\[dataDir]/g,baseDir); //css文件的动态路径需单独处理  
          writeCss(name,css);
          if(callback!=null){
            callback(); //回调，执行下一个引用  
          }
        }
      }
      else{
        linkCss(url);
      }
    };//加载css
    var writeJs=function(_url,text){
      var url=_url;
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("script");
      link.setAttribute("type","text/javascript");
      link.setAttribute("data-name",url);
      if(url.indexOf("require")>0){
        /* link.defer=true;
         link.async=true;*/
        link.setAttribute("data-main",baseDir+"js/"+modDir+min);
      }
      link.innerHTML=text;
      head.appendChild(link);
    };//往页面写入js
    var writeCss=function(_url,_text){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("style");
      link.setAttribute("type","text/css");
      link.setAttribute("data-name",_url);
      link.innerHTML=_text;
      head.appendChild(link);
    };//往页面写入css
    var linkJs=function(url){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("script");
      //link.type="text/javascript";
      if(url.indexOf("require.js")>0){
        //link.defer=true;
        //link.async=true;
        link.setAttribute("data-main",baseDir+"js/"+modDir+min);
      }
      link.src=url;
      head.appendChild(link);
    };//往页面引入js  
    var linkCss=function(url){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("link");
      link.type="text/css";
      link.rel="stylesheet";
      link.rev="stylesheet";
      link.media="screen";
      link.href=url;
      head.appendChild(link);
    };//往页面引入css
    var loadSort=function(_thisDir,_modules,_type,callback){
      var thisDir=_thisDir;
      var modules=removeRepeat(_modules);
      var fileType=_type.toUpperCase();
      //if(navigator.appName==="Microsoft Internet Explorer"&&parseInt(navigator.appVersion.split(";")[1].replace("MSIE",""))<9&&fileType==="JS" ) modules.splice(0,0,"html5shiv");//IE版本小于9
      var i=-1;
      var per=function(){
        i++;
        if(i>=modules.length){
          if(typeof(callback)!="undefined") callback.call(this);
          return false;
        }
        else{
          if(fileType==="JS") loadJs(thisDir+modules[i]+min,per);
          if(fileType==="CSS") loadCss(thisDir+modules[i]+min,per);
        }
      };
      per();
    };
    var returnVersion=function(){
      var newDate=new Date();
      return min==="" ? ""+newDate.getTime() : ""+(newDate.getMonth()+1)+newDate.getDate()+Math.ceil((newDate.getHours()+1)/2);
    };
    var val=_val||{};
    var thisVal={
      dataDir:val.dataDir||baseDir,
      dataCss:val.dataCss||[],
      dataJs:val.dataJs||[],
      callback:val.callback||null,
      updateVersion:val.updateVersion||false//当设置为true时,每两个小时更新一个版本,注意当有多个byLoader实例同时执行时,只需在最后一个执行时设置为true,因为连续更新缓存版本,会误导后面的版本判断,故添加此参数
    };
    this.dataDir=thisVal.dataDir;
    this.dataCss=thisVal.dataCss;
    this.dataJs=thisVal.dataJs;
    this.callback=thisVal.callback;
    this.updateVersion=thisVal.updateVersion;
    this.run=function(){
      thisVersion=returnVersion();
      var thisDataCss=removeEmpty(this.dataCss.join(",").replace(/_css/g,modDir).split(","));
      var thisDataJs=removeEmpty(this.dataJs.join(",").replace(/_js/g,modDir).split(","));
      var thisBaseDir=this.dataDir;
      var callback=this.callback;
      var updateVersion=this.updateVersion;
      baseDir=thisBaseDir;
      var loadAllCallback=function(){
        //更新版本号会让程序认为缓存数据是最新的(版本号为"00000"时除外),从而在下次更新版本号之前可以优先从缓存中读取 
        if(thisVersion!==priVersion&&updateVersion===true) localStorage.setItem("byLoadDataVersion",thisVersion);
        if(min.length===0||priVersion===null) localStorage.setItem("byLoadDataVersion","00000");//本地模式,强制thisVersion!==priVersion
        if(callback!=null) callback.call(this);
      };
      var loadCssCallback=function(){ loadSort(thisBaseDir+"js/",thisDataJs,"js",loadAllCallback);};
      loadSort(thisBaseDir+"css/",thisDataCss,"css",loadCssCallback);
    };
  };
  var thisLoader=new byLoader();
  thisLoader.dataDir=baseDir;
  thisLoader.dataCss=dataCss;
  thisLoader.dataJs=dataJs;
  thisLoader.updateVersion=update;
  thisLoader.run();
  byLoader.version="v0.00.012";
})();