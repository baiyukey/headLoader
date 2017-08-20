/* 
 see detail: http://dwz.cn/byloader
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
  }
  else{
    if(reLog) console.log('%c友情提示:script标签无"data-css"属性',"color:#69F;");
  }
  if(thisScript.hasAttribute("data-js")){
    dataJs=thisScript.getAttribute("data-js").split(",");//.replace(/_js/g,modDir);
  }
  else{
    if(reLog) console.log('%c友情提示:script标签无"data-js"属性',"color:#69F;");
  }
  window.headLoader=function(_val){
    var min=/^((192\.168|172\.([1][6-9]|[2]\d|3[01]))(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}|10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3})|(localhost)$/.test(window.location.hostname) ? "" : ".min";
    var thisVersion="";
    var setAttribute=function(_node,_property){
      if(_property.length>0){
        _property.forEach(function(e,i){
          _node.setAttribute(e.split("=")[0],e.split("=")[1]);
        });
      }
    };
    var loadJs=function(_thisDir,callback){
      if(window.localStorage&&_thisDir.indexOf("http")!==0){
        var thisDir=_thisDir.split("|")[0];
        var name=thisDir.indexOf(".js")>0 ? thisDir.replace(".js","")+min : thisDir+min;
        var url=thisDir.indexOf(".js")>0 ? thisDir.replace(".js",(min+".js"))+"?"+returnVersion() : thisDir+min+".js?"+returnVersion();
        var xhr;
        var js=localStorage.getItem(name);
        var getItemVersion=localStorage.getItem(name+"Version");
        if(js==null||js.length==0||getItemVersion!=returnVersion()){
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
                js=js==null ? "" : js;
                writeJs(_thisDir,js);
                localStorage.setItem(name,js);
                localStorage.setItem(name+"Version",returnVersion());
                if(callback!=null){
                  callback(); //回调，执行下一个引用  
                }
              }
            };
          }
        }
        else{
          writeJs(_thisDir,js);
          if(callback!=null){
            callback();  //回调，执行下一个引用  
          }
        }
      }
      else{
        linkJs(_thisDir);
      }
    };//加载js
    var loadCss=function(_url,callback){
      if(window.localStorage&&_url.indexOf("http")!==0){
        var thisDir=_url.split("|")[0];
        var name=thisDir.indexOf(".css")>0 ? thisDir.replace(".css","")+min : thisDir+min;
        var url=thisDir.indexOf(".css")>0 ? thisDir.replace(".css",(min+".css"))+"?"+returnVersion() : thisDir+min+".css?"+returnVersion();
        var xhr;
        var css=localStorage.getItem(name);
        var getItemVersion=localStorage.getItem(name+"Version");
        if(css==null||css.length==0||getItemVersion!=returnVersion()){
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
                css=css.replace(/\[v]/g,returnVersion(24)); //css文件中的静态文件缓存24小时更新一次
                writeCss(_url,css);
                localStorage.setItem(name,css);
                localStorage.setItem(name+"Version",returnVersion());
                if(callback!=null){
                  callback(); //回调，执行下一个引用  
                }
              }
            };
          }
        }
        else{
          writeCss(_url,css);
          if(callback!=null){
            callback(); //回调，执行下一个引用  
          }
        }
      }
      else{
        linkCss(_url);
      }
    };//加载css
    var writeJs=function(_url,text){
      var url=_url;
      var head=document.getElementsByTagName('HEAD').item(0);
      var thisTag=document.createElement("script");
      setAttribute(thisTag,url.split("|").splice(1));
      thisTag.setAttribute("type","text/javascript");
      thisTag.setAttribute("data-name",url.split("|")[0].replace(".js","")+min);
      thisTag.innerHTML=text;
      head.appendChild(thisTag);
    };//往页面写入js
    var writeCss=function(_url,_text){
      var head=document.getElementsByTagName('HEAD').item(0);
      var thisTag=document.createElement("style");
      setAttribute(thisTag,_url.split("|").splice(1));
      thisTag.setAttribute("type","text/css");
      thisTag.setAttribute("data-name",_url.split("|")[0].replace(".css","")+min);
      thisTag.innerHTML=_text;
      head.appendChild(thisTag);
    };//往页面写入css
    var linkJs=function(url){
      var head=document.getElementsByTagName('HEAD').item(0);
      var thisTag=document.createElement("script");
      //link.type="text/javascript";
      setAttribute(thisTag,url.split("|").splice(1));
      thisTag.src=url.indexOf("http")===0 ? url.split("|")[0] : url.split("|")[0].replace(".js","")+min+".js?"+returnVersion();
      head.appendChild(thisTag);
    };//往页面引入js  
    var linkCss=function(url){
      var head=document.getElementsByTagName('HEAD').item(0);
      var thisTag=document.createElement("link");
      setAttribute(thisTag,url.split("|").splice(1));
      thisTag.type="text/css";
      thisTag.rel="stylesheet";
      thisTag.rev="stylesheet";
      thisTag.media="screen";
      thisTag.href=url.indexOf("http")===0 ? url.split("|")[0] : url.split("|")[0].replace(".css","")+min+".css?"+returnVersion();
      head.appendChild(thisTag);
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
          var thisModule=modules[i].indexOf("http://")===0||modules[i].indexOf("https://")===0 ? modules[i] : (thisDir+modules[i]);
          if(fileType==="JS") loadJs(thisModule,per);
          else if(fileType==="CSS") loadCss(thisModule,per);
        }
      };
      per();
    };
    var returnVersion=function(_hours){
      var newDate=new Date();
      var hours=_hours||2;
      hours=Math.min(24,hours);
      return min==="" ? ""+newDate.getTime() : ""+(newDate.getMonth()+1)+newDate.getDate()+Math.ceil((newDate.getHours()+1)/hours);
    };
    var val=_val||{};
    var thisVal={
      dataDir:val.dataDir||baseDir,
      dataCss:val.dataCss||[],
      dataJs:val.dataJs||[],
      callback:val.callback||null
    };
    this.dataDir=thisVal.dataDir;
    this.dataCss=thisVal.dataCss;
    this.dataJs=thisVal.dataJs;
    this.callback=thisVal.callback;
    this.run=function(){
      thisVersion=returnVersion();
      var thisDataCss=removeEmpty(this.dataCss.join(",").replace(/_css/g,modDir).split(","));
      var thisDataJs=removeEmpty(this.dataJs.join(",").replace(/_js/g,modDir).split(","));
      var thisBaseDir=this.dataDir;
      var callback=this.callback;
      baseDir=thisBaseDir;
      var loadAllCallback=function(){
        if(callback!=null) callback.call(this);
      };
      var loadCssCallback=function(){ loadSort(thisBaseDir+"js/",thisDataJs,"js",loadAllCallback);};
      loadSort(thisBaseDir+"css/",thisDataCss,"css",loadCssCallback);
    };
  };
  var thisLoader=new headLoader();
  thisLoader.dataDir=baseDir;
  thisLoader.dataCss=dataCss;
  thisLoader.dataJs=dataJs;
  thisLoader.run();
  headLoader.version="v0.00.015";
})();