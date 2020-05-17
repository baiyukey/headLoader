/* 
 author:baiyukey@qq.com
 see detail: http://www.uielf.com/headloaderIndex.html
 cacheVersion:new headLoader().version
 */
let headLoader,headUnLoad;
;(function(_global){
  headLoader=function(_val){
    let val=_val||{};
    this.dataDir=val.dataDir||"";
    this.dataCss=val.dataCss||[];
    this.dataJs=val.dataJs||[];
    this.callback=val.callback||null;//加载完成后的回调
    this.multiLoad=val.multiLoad||true;//是否并行加载资源
    this.version="v0.30.00";
    let that=this;//关键字避嫌
    let min=/^((192\.168|172\.([1][6-9]|[2]\d|3[01]))(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}|10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3})|(localhost)$/.test(_global.location.hostname) ? "" : ".min";//直接返回"min"时将无缓存机制
    let getCacheVersion=function(_hours){
      let newDate=new Date();
      let hours=_hours||2;//每天中的每两个小时为一个值
      hours=Math.min(24,hours);
      return min==="" ? ""+newDate.getTime() : ""+(newDate.getMonth()+1)+newDate.getDate()+Math.ceil((newDate.getHours()+1)/hours);
    };
    let standardized=function(_arr){
      let reArr=[];
      let thisStr="";
      for(let i=0; i<_arr.length; i++){
        thisStr=_arr[i].replace(/^(\s*)|(\s*)$/g,"");//去前后空格
        if(thisStr.length!==0&&reArr.indexOf(thisStr)<0) reArr.push(thisStr);//去重
      }
      return reArr;
    };
    let setAttribute=function(_node,_property){
      if(_property.length>0){
        _property.forEach(function(e){
          _node.setAttribute(e.split("=")[0],e.split("=")[1]);
        });
      }
    };
    if(typeof _global["headLoaderCache"]==="undefined"){
      //console.log(_global["headLoaderCache"]);
      _global["headLoaderCache"]={};
    }
    //let thisKey='';
    let setCache=function(_cacheKey,_value){
      _global["headLoaderCache"][_cacheKey]=_value;
      _global.localStorage.setItem(_cacheKey,_value);
    };
    let getCache=function(_cacheKey){
      return (_global["headLoaderCache"][_cacheKey]||localStorage.getItem(_cacheKey));  //没有时返回null，如果有值返回""或字符串
    };
    let loadJs=function(_url,_callback){
      let thisDir=_url.split("|")[0].replace(/\/js\//,"/js"+min+"/");
      let fileName=thisDir.indexOf(".js")>0 ? thisDir.replace(".js","")+min : thisDir+min;
      let url=thisDir.indexOf(".js")>0 ? thisDir.replace(".js",(min+".js"))+"?v="+cacheVersion : thisDir+min+".js?v="+cacheVersion;
      if(_url.indexOf("http://")!==0){
        let xhr,cacheKey=fileName.replace(/\./g,'_');
        let js=getCache(cacheKey);
        let thisCacheVersion=getCache(cacheKey+"_cacheVersion");
        if(js===null||thisCacheVersion!==cacheVersion){
          if(window.XMLHttpRequest){
            xhr=new XMLHttpRequest();
          }
          else if(window.ActiveXObject){
            xhr=new ActiveXObject("Microsoft.XMLHTTP");
          }
          if(typeof (xhr)!=="undefined"){
            xhr.open("GET",url);
            xhr.send(null);
            xhr.onreadystatechange=function(){
              if(Number(xhr.readyState)===4&&Number(xhr.status)===200){
                js=xhr.responseText;
                js=js===null ? "" : js;
                setCache(cacheKey,js);
                setCache(cacheKey+"_cacheVersion",cacheVersion);
                mediaLength++;//增加一次资源加载次数
                if(typeof (_callback)==="function"){
                  _callback(); //回调，执行下一个引用  
                }
              }
            };
          }
        }
        else{
          if(typeof (_callback)==="function") _callback();
        }
      }
      else{
        linkJs(_url.indexOf("http://")!==0 ? url : _url);
      }
    };//加载js
    let loadCss=function(_url,_callback){
      let thisDir=_url.split("|")[0].replace(/\/css\//,"/css"+min+"/");
      let fileName=thisDir.indexOf(".css")>0 ? thisDir.replace(".css","")+min : thisDir+min;
      let url=thisDir.indexOf(".css")>0 ? thisDir.replace(".css",(min+".css"))+"?v="+cacheVersion : thisDir+min+".css?v="+cacheVersion;
      if(_url.indexOf("http://")!==0){
        let xhr,cacheKey=fileName.replace(/\./g,'_');
        let css=getCache(cacheKey);
        let thisCacheVersion=getCache(cacheKey+"_cacheVersion");
        if(css===null||thisCacheVersion!==cacheVersion){
          if(window.XMLHttpRequest){
            xhr=new XMLHttpRequest();
          }
          else if(window.ActiveXObject){
            xhr=new ActiveXObject("Microsoft.XMLHTTP");
          }
          if(typeof (xhr)!=="undefined"){
            xhr.open("GET",url);
            xhr.send(null);
            xhr.onreadystatechange=function(){
              if(Number(xhr.readyState)===4&&Number(xhr.status)===200){
                css=xhr.responseText;
                css=css===null ? "" : css;
                css=css.replace(/\[dataDir]/g,dataDir); //css文件的动态路径需单独处理
                css=css.replace(/\[v]/g,mediaCacheVersion);
                setCache(cacheKey,css);
                setCache(cacheKey+"_cacheVersion",cacheVersion);
                mediaLength++;//增加一次资源加载次数
                if(typeof (_callback)==="function") _callback();
              }
            };
          }
        }
        else{
          if(typeof (_callback)==="function"){
            _callback(); //回调，执行下一个引用  
          }
        }
      }
      else{
        linkCss(_url.indexOf("http://")!==0 ? url : _url);
      }
    };//加载css
    let writeJs=function(_url,_text){
      if(document.getElementsByTagName('HEAD').length===0) return false;
      let head=document.getElementsByTagName('HEAD').item(0);
      let thisTag=document.createElement("script");
      setAttribute(thisTag,_url.split("|").splice(1));//用于js标签自定义属性，例如_url=?id=888|data-value=999这类的属性定义
      thisTag.setAttribute("type","text/javascript");
      thisTag.setAttribute("data-name",_url.split("|")[0].replace(".js","")+min);
      thisTag.innerHTML=_text;
      head.appendChild(thisTag);
    };//往页面写入js
    let writeCss=function(_url,_text){
      if(document.getElementsByTagName('HEAD').length===0) return false;
      let head=document.getElementsByTagName('HEAD').item(0);
      let thisTag=document.getElementsByTagName('style').item(0);
      if(thisTag){
        thisTag.innerHTML+=_text;
        return false;
      }
      thisTag=document.createElement("style");
      setAttribute(thisTag,_url.split("|").splice(1));
      thisTag.setAttribute("type","text/css");
      thisTag.setAttribute("data-name",_url.split("|")[0].replace(".css","")+min);
      thisTag.innerHTML=_text;
      head.appendChild(thisTag);
    };//往页面写入css
    let linkJs=function(_url){
      if(document.getElementsByTagName('HEAD').length===0) return false;
      let head=document.getElementsByTagName('HEAD').item(0);
      let thisTag=document.createElement("script");
      //link.type="text/javascript";
      setAttribute(thisTag,_url.split("|").splice(1));
      thisTag.src=_url.indexOf("http")===0 ? _url.split("|")[0] : _url.split("|")[0].replace(".js","")+min+".js?"+cacheVersion;
      head.appendChild(thisTag);
    };//往页面引入js  
    let linkCss=function(_url){
      if(document.getElementsByTagName('HEAD').length===0) return false;
      let head=document.getElementsByTagName('HEAD').item(0);
      let thisTag=document.createElement("link");
      setAttribute(thisTag,_url.split("|").splice(1));
      thisTag.type="text/css";
      thisTag.rel="stylesheet";
      thisTag.rev="stylesheet";
      thisTag.media="screen";
      thisTag.href=_url.indexOf("http")===0 ? _url.split("|")[0] : _url.split("|")[0].replace(".css","")+min+".css?"+cacheVersion;
      head.appendChild(thisTag);
    };//往页面引入css
    let writeThese=function(_thisDir,_modules,_fileType){
      let thisDir=_thisDir.split("|")[0];
      if(_fileType==="JS") thisDir=thisDir.replace(/\/js\//,"/js"+min+"/");
      if(_fileType==="CSS") thisDir=thisDir.replace(/\/css\//,"/css"+min+"/");
      let cacheKey;
      let writeCode={
        "JS":writeJs,
        "CSS":writeCss
      }[_fileType];
      let code=_modules.map((_k)=>{
        cacheKey=(thisDir+_k.replace(/(\.js)|(\.css)/g,"")+min).replace(/\./g,'_');
        return getCache(cacheKey);
      }).join(_fileType==='JS' ? ';' : ' ');
      writeCode(_fileType+'_'+cacheVersion,code);
    };
    let loadCount=function(){
      let thisDuration=new Date().getTime()-startTime;
      _global.headLoaderHistory=typeof (_global.headLoaderHistory)!=="undefined" ? _global.headLoaderHistory : [];//用于统计当前框架共加载文件的总时长
      if(mediaLength>0) _global.headLoaderHistory=_global.headLoaderHistory.concat(new Array(mediaLength-1).fill(0),thisDuration);
      if(typeof _global.loadCountTimeout!=="undefined") clearTimeout(_global.loadCountTimeout);
      _global.loadCountTimeout=setTimeout(()=>{
        let durationCount=0,avg=thisDuration;//有效加载历史的总时间
        if(_global.headLoaderHistory.length>0){
          durationCount=_global.headLoaderHistory.reduce((_v,_c)=>_v+_c);
          avg=Math.ceil(durationCount/_global.headLoaderHistory.length);
        }
        console.log('headLoader当前页面'+(that.multiLoad ? "并行" : "串行")+'网络请求%c'+mediaLength+'个%cJS/CSS文件，程序用时%c'+thisDuration+'毫秒%c，累计网络请求%c'+_global.headLoaderHistory.length+'个%cJS/CSS文件，单文件平均程序用时%c'+avg+'毫秒','color:#1b8884','','color:#1b8884','','color:#1b8884','','color:#1b8884','');
      },3000);
    };
    let loadThese=function(_thisDir,_modules,_fileType,_callback){
      if(document.getElementsByTagName('HEAD').length===0) return false;
      if(!_modules||_modules.length===0){
        if(typeof (_callback)==="function") _callback.call(false);
        return false;
      }
      let loadCode={
        "JS":loadJs,
        "CSS":loadCss
      }[_fileType];
      //if(navigator.appName==="Microsoft Internet Explorer"&&parseInt(navigator.appcacheVersion.split(";")[1].replace("MSIE",""))<9&&_fileType==="JS" ) modules.splice(0,0,"html5shiv");//IE版本小于9
      let oneByOne=function(){
        let i=0;
        let runThis=function(){
          if(i>=_modules.length){
            if(_modules&&i!==0){
              writeThese(_thisDir,_modules,_fileType);
            }
            if(typeof (_callback)==="function") _callback.call(false);
          }
          else{
            let thisModule=_modules[i].indexOf("http://")===0||_modules[i].indexOf("https://")===0 ? _modules[i] : (_thisDir+_modules[i]);
            i++;
            loadCode(thisModule,runThis);
          }
        };
        runThis();
      };//串行
      let promiseAll=function(){
        if(!_modules||_modules.length===0){
          if(typeof (_callback)==="function") _callback.call(false);
          return false;
        }
        let promises,thisModule;
        promises=new Array(_modules.length).fill(0).map((v,i)=>new Promise(function(_resolve){
          thisModule=_modules[i].indexOf("http://")===0||_modules[i].indexOf("https://")===0 ? _modules[i] : (_thisDir+_modules[i]);
          loadCode(thisModule,()=>_resolve("success"));
        }));
        Promise.all(promises).then(()=>{
          if(_modules.length!==0) writeThese(_thisDir,_modules,_fileType);
          if(typeof (_callback)==="function") _callback.call(false);
        });
      };//并行
      (that.multiLoad ? promiseAll : oneByOne)();
    };//加载
    this.run=function(){
      that.dataCss=standardized(that.dataCss.join(",").replace(/_css/g,modDir).split(","));
      that.dataJs=standardized(that.dataJs.join(",").replace(/_js/g,modDir).split(","));
      cacheVersion=getCacheVersion();
      mediaCacheVersion=getCacheVersion(24);//不论什么环境css文件中的静态文件缓存24小时更新一次,例如图片,字体等
      let loadAllCallback=function(){
        loadCount();
        if(typeof (that.callback)==="function") that.callback.call(false);
      };
      let loadCssCallback=function(){ loadThese(that.dataDir+"js/",that.dataJs,"JS",loadAllCallback);};
      loadThese(that.dataDir+"css/",that.dataCss,"CSS",loadCssCallback);//先加载dataCss，后加载dataJs
    };
  };
  headUnLoad=function(){
    if(document.readyState!=="complete"){
      window.requestAnimationFrame(headUnLoad);
      return false;
    }
    let thisScript=document.getElementsByTagName("script").item(0);
    if(thisScript){
      thisScript.remove();
      headUnLoad();
    }
  };
  //_global.headLoader=_global.headLoader ? _global.headLoader : headLoader;
  let allScript=document.getElementsByTagName("script");
  let thisScript;
  let dataJs=[],
    dataCss=[];
  let dataDir;
  let update=false;
  let cacheVersion="";//每项缓存文件的缓存版本
  let mediaCacheVersion="";//css文件中的静态文件的缓存版本
  let mediaLength=0;//文件个数，用于统计页面加载多少个文件
  let startTime=new Date().getTime();//开始时间，用于统计页面加载时长
  for(let i=0; i<allScript.length; i++){
    if(allScript[i].hasAttribute("src")&&allScript[i].getAttribute("src").indexOf(atob("aGVhZExvYWRlci4="))>=0){
      thisScript=allScript.item(i);
      break;
    }
  }
  if(!thisScript){
    if(console.log) console.log("%c"+decodeURIComponent(atob("JUU5JTk0JTk5JUU4JUFGJUFGJUU2JThGJTkwJUU3JUE0JUJBJTNBJUU3JUE4JThCJUU1JUJBJThGJUU2JTlDJUFBJUU2JTg4JTkwJUU1JThBJTlGJUU2JTg5JUE3JUU4JUExJThDJTJDJUU2JThGJTkyJUU0JUJCJUI2JUU1JTkwJThEJUU3JUE3JUIwJUU0JUI4JUJBaGVhZExvYWRlci5qcyVFNiU4OCU5NiVFOCU4MCU4NWhlYWRMb2FkZXIubWluLmpzJUU2JUIzJUE4JUU2JTg0JThGJUU1JUE0JUE3JUU1JUIwJThGJUU1JTg2JTk5LiVFNSVBNiU4MiVFNiU5QyU4OSVFNyU5NiU5MSVFOSU5NyVBRSVFOCVBRiVCNyVFOCVBRSVCRiVFOSU5NyVBRSUzQWh0dHBzJTNBJTJGJTJGZ2l0aHViLmNvbSUyRmJhaXl1a2V5JTJGaGVhZExvYWRlcg==")),"color:#F00");
    return false;
  }
  let reLog=console.log&&thisScript.getAttribute("src").indexOf(".min")<0;
  let staticDir=location.pathname.split("/")[1]==="static" ? "/static" : "/";
  let modDir=location.pathname.replace(staticDir,"").replace(".html","");
  if(location.pathname.replace(/.*\//,"").replace(".html","")==="") modDir+="index";
  modDir=modDir.indexOf("/")===0 ? modDir.substr(1) : modDir;
  if(thisScript.hasAttribute("data-update-cacheVersion")){
    update=thisScript.getAttribute("data-update-cacheVersion");
  }
  else{
    if(reLog) console.log('%c友情提示:script标签无"data-update-cacheVersion"属性,默认为false.',"color:#69F;");
  }
  if(thisScript.hasAttribute("data-dir")){
    dataDir=thisScript.getAttribute("data-dir");
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
  let thisLoader=new headLoader();
  if(dataDir) thisLoader.dataDir=dataDir;
  thisLoader.dataCss=dataCss;
  thisLoader.dataJs=dataJs;
  thisLoader.run();
})(window.location.origin===window.top.location.origin ? window.top : window);
