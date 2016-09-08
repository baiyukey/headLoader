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
  for(var i=0; i<allScript.length; i++){
    if(allScript[i].hasAttribute("src")&&allScript[i].getAttribute("src").indexOf(atob("YnlMb2FkZXIu"))>=0) thisScript=allScript[i];
  }
  if(thisScript===null){
    if(console.log) console.log("%c"+decodeURIComponent(atob("JUU5JTk0JTk5JUU4JUFGJUFGJUU2JThGJTkwJUU3JUE0JUJBJTNBJUU3JUE4JThCJUU1JUJBJThGJUU2JTlDJUFBJUU2JTg4JTkwJUU1JThBJTlGJUU2JTg5JUE3JUU4JUExJThDJTJDJUU2JThGJTkyJUU0JUJCJUI2JUU1JTkwJThEJUU3JUE3JUIwJUU0JUI4JUJBYnlMb2FkZXIuanMlRTYlODglOTYlRTglODAlODVieUxvYWRlci5taW4uanMlRTYlQjMlQTglRTYlODQlOEYlRTUlQTQlQTclRTUlQjAlOEYlRTUlODYlOTkuJUU1JUE2JTgyJUU2JTlDJTg5JUU3JTk2JTkxJUU5JTk3JUFFJUU4JUFGJUI3JUU4JUFFJUJGJUU5JTk3JUFFJTNBaHR0cHMlM0ElMkYlMkZnaXRodWIuY29tJTJGYmFpeXVrZXklMkZieUxvYWRlcg==")),"color:#F00");
    return false;
  }
  var reLog=console.log&&thisScript.getAttribute("src").indexOf(atob("Lm1pbg=="))<0;
  var staticDir=location.pathname.split("/")[1]=="static" ? "/static" : "/";
  var modDir=location.pathname.replace(staticDir,"").replace(".html","");
  var jsMode="modules/"+modDir;
  if(thisScript.hasAttribute("data-dir")){
    baseDir=thisScript.getAttribute("data-dir");
  }
  else{
    if(reLog) console.log('友情提示:未设置"data-dir"属性.');
  }
  if(thisScript.hasAttribute("data-css")){
    dataCss=removeEmpty(thisScript.getAttribute("data-css").split(","));
    dataCss.push(modDir);
  }
  else{
    if(reLog) console.log('友情提示:未设置"data-css"属性');
  }
  if(thisScript.hasAttribute("data-js")){
    dataJs=removeEmpty(thisScript.getAttribute("data-js").split(","));
    if(dataJs.indexOf("require")<0) dataJs.push(jsMode);
  }
  else{
    if(reLog) console.log('友情提示:未设置"data-js"属性');
  }
  window.byLoader=function(_val){
    var min=/^((192\.168|172\.([1][6-9]|[2]\d|3[01]))(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}|10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3})|(localhost)$/.test(window.location.hostname) ? "" : ".min";
    var thisVersion="";
    var loadJs=function(_thisDir,callback){
      var name=_thisDir;
      var url=_thisDir;
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
    var loadCss=function(_url,callback){
      var name=_url;
      var url=_url;
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
    var writeJs=function(_url,text){
      var url=_url;
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("script");
      link.setAttribute("type","text/javascript");
      link.setAttribute("data-name",url);
      if(url.indexOf("require")>0){
        /* link.defer=true;
         link.async=true;*/
        link.setAttribute("data-main",baseDir+"js/"+jsMode+min);
      }
      link.innerHTML=text;
      head.appendChild(link);
    };//往页面写入js脚本  
    var writeCss=function(_url,_text){
      var head=document.getElementsByTagName('HEAD').item(0);
      var link=document.createElement("style");
      link.setAttribute("type","text/css");
      link.setAttribute("data-name",_url);
      link.innerHTML=_text;
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
    var loadSort=function(_thisDir,_modules,_type,callBack){
      var thisDir=_thisDir;
      var modules=removeRepeat(_modules);
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
          if(fileType==="JS") loadJs(thisDir+modules[i]+min,per);
          if(fileType==="CSS") loadCss(thisDir+modules[i]+min,per);
        }
      };
      per();
    };
    var setVersion=function(){
      localStorage.setItem("version",thisVersion);
    };
    var getVersion=function(){ return min==="" ? ""+new Date().getTime() : ""+new Date().getMonth()+new Date().getDate()+Math.ceil((new Date().getHours()+1)/2);};
    var val=_val||{};
    var thisVal={
      dataDir:val.dataDir||baseDir,
      dataCss:val.dataCss||[],
      dataJs:val.dataJs||[]
    };
    this.dataDir=thisVal.dataDir;
    this.dataCss=thisVal.dataCss;
    this.dataJs=thisVal.dataJs;
    this.run=function(){
      thisVersion=getVersion();
      var thisDataCss=this.dataCss;
      var thisDataJs=this.dataJs;
      var thisBaseDir=this.dataDir;
      baseDir=thisBaseDir;
      var loadCssCallback=function(){ loadSort(thisBaseDir+"js/",thisDataJs,"js",setVersion);};
      loadSort(thisBaseDir+"css/",thisDataCss,"css",loadCssCallback);
    };
  };
  var thisLoader=new byLoader();
  thisLoader.dataDir=baseDir;
  thisLoader.dataCss=dataCss;
  thisLoader.dataJs=dataJs;
  thisLoader.run();
  byLoader.version="v0.00.005";
})();