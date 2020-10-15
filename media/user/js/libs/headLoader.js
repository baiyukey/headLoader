/**
 * headLoader用于加载页面资源及管理css, js缓存，使页面加载实现快速响应，节省网络流量，降低服务器压力的目的。
 * @global : headLoader
 * @author: 宇哥 baiyukey@qq.com
 * @link : https://github.com/baiyukey/headLoader
 * @version : 1.0.0
 * @copyright : http://www.uielf.com
 */
let headLoader;
(function(_global){
  let min=/^((192\.168|172\.([1][6-9]|[2]\d|3[01]))(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}|10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3})|(localhost)$/.test(_global.location.hostname) ? "" : ".min";//直接返回"min"时将无缓存机制
  headLoader=function(_val){
    let val=_val || {};
    this.dataDir=val.dataDir || "";
    this.dataCss=val.dataCss || [];
    this.dataJs=val.dataJs || [];
    this.callback=val.callback || null;//加载完成后的回调
    this.multiLoad=val.multiLoad || (min===".min");//默认线上并行加载
    this.showLoadCount=val.showLoadCount || false;//默认不显示加载统计
    let that=this;//关键字避嫌
    let isLink=(_thisMode)=>_thisMode.indexOf("http://")===0 || _thisMode.indexOf("https://")===0;
    let getCacheVersion=function(_hours){
      let newDate=new Date();
      let hours=_hours || 2;//每天中的每两个小时为一个值
      hours=Math.min(24,hours);
      return min==="" ? ""+newDate.getTime() : ""+(newDate.getMonth()+1)+newDate.getDate()+Math.ceil((newDate.getHours()+1)/hours);
    };
    let standardized=function(_arr){
      let reArr=[];
      let thisStr="";
      for(let i=0; i<_arr.length; i++){
        thisStr=_arr[i].replace(/^(\s*)|(\s*)$/g,"");//去前后空格
        if( thisStr.length!==0 && reArr.indexOf(thisStr)<0 ) reArr.push(thisStr);//去重
      }
      return reArr;
    };
    let setAttribute=function(_node,_property){
      if( _property.length>0 ){
        _property.forEach(function(e){
          _node.setAttribute(e.split("=")[0],e.split("=")[1]);
        });
      }
    };
    if( typeof _global["headLoaderCache"]==="undefined" ){
      _global["headLoaderCache"]={};
    }
    let hex=function(){
      let bet="";
      for(let i=48; i<=122; i++){
        if( (i>=58 && i<=64) || (i>=91 && i<=96) ) continue;
        bet+=String.fromCharCode(i);
      }
      bet=bet.replace(/[aeiouAEIOU01]/g,"");
      bet=bet.slice(0,18)+"$-_+!*"+bet.slice(18);
      let betLength=bet.length;
      let activeIndex=location.host.length;
      let chatAt=-1;
      let url='';
      let returnUrl='';
      this.encode=function(_url){
        url=encodeURIComponent(_url).replace(/\./g,"&dot");
        returnUrl='';
        chatAt= -1;
        for(let i=0; i<url.length; i++){
          chatAt=bet.indexOf(url.charAt(i));
          //str+=(_alphabet.indexOf(_url[i])>0 ? _alphabet.indexOf(_url[i]) : _url.charCodeAt(i));
          returnUrl+=chatAt<0 ? url.charAt(i) : bet.charAt((chatAt+activeIndex)%betLength);
        }
        return returnUrl;
      };
    };
    let setCache=function(_cacheKey,_value){
      ((_k,_v)=>{
        _global["headLoaderCache"][_k]=_v;
        _global.localStorage.setItem(_k,_v);
      })(thisHex.encode(_cacheKey),_value);
    };
    let getCache=function(_cacheKey){
      return ((_k)=>{
        if( ! _global["headLoaderCache"][_k] ) _global["headLoaderCache"][_k]=_global.localStorage.getItem(_k);
        return _global["headLoaderCache"][_k];  //没有时返回null，如果有值返回""或字符串
      })(thisHex.encode(_cacheKey));
    };
    let getUrl=function(_module,_type){
      return ((that.dataDir+_type+min+'/'+_module.split("|")[0]).replace("."+_type,"")+min)+"."+_type;//.js不一定是最后的字符
    };
    let getCacheKey=function(_module,_type){
      return ((that.dataDir+_type+min+'/'+_module.split("|")[0]).replace("."+_type,"")+min).replace(/\./g,'_');
    };
    let loadJs=function(_module,_callback){
      if( isLink(_module) ){
        linkJs(_module);
        if( typeof (_callback)==="function" ) _callback(); //回调，执行下一个引用
        return false;
      }
      let url=getUrl(_module,"js")+"?v="+cacheVersion;//.js不一定是最后的字符
      let cacheKey=getCacheKey(_module,"js");
      let xhr;
      let js=getCache(cacheKey);
      let thisCacheVersion=getCache(cacheKey+"_version");
      if( js===null || thisCacheVersion!==cacheVersion ){
        if( window.XMLHttpRequest ){
          xhr=new XMLHttpRequest();
        }
        else if( window.ActiveXObject ){
          xhr=new ActiveXObject("Microsoft.XMLHTTP");
        }
        if( typeof (xhr)!=="undefined" ){
          xhr.open("GET",url);
          xhr.send(null);
          xhr.onreadystatechange=function(){
            if( Number(xhr.readyState)===4 && Number(xhr.status)===200 ){
              js=xhr.responseText;
              js=js===null ? "" : js;
              setCache(cacheKey,js);
              setCache(cacheKey+"_version",cacheVersion);
              mediaLength++;//增加一次资源加载次数
              if( typeof (_callback)==="function" ) _callback(); //回调，执行下一个引用
            }
          };
        }
      }
      else{
        if( typeof (_callback)==="function" ) _callback(); //回调，执行下一个引用
      }
    };//加载js
    let loadCss=function(_module,_callback){
      if( isLink(_module) ){
        linkCss(_module);
        if( typeof (_callback)==="function" ) _callback(); //回调，执行下一个引用
        return false;
      }
      let url=getUrl(_module,"css")+"?v="+cacheVersion;//.js不一定是最后的字符
      let cacheKey=getCacheKey(_module,"css");
      let xhr;
      let css=getCache(cacheKey);
      let thisCacheVersion=getCache(cacheKey+"_version");
      if( css===null || thisCacheVersion!==cacheVersion ){
        if( window.XMLHttpRequest ){
          xhr=new XMLHttpRequest();
        }
        else if( window.ActiveXObject ){
          xhr=new ActiveXObject("Microsoft.XMLHTTP");
        }
        if( typeof (xhr)!=="undefined" ){
          xhr.open("GET",url);
          xhr.send(null);
          xhr.onreadystatechange=function(){
            if( Number(xhr.readyState)===4 && Number(xhr.status)===200 ){
              css=xhr.responseText;
              css=css===null ? "" : css;
              css=css.replace(/\[dataDir]/g,that.dataDir); //css文件的动态路径需单独处理
              css=css.replace(/\[v]/g,mediaCacheVersion);
              setCache(cacheKey,css);
              setCache(cacheKey+"_version",cacheVersion);
              mediaLength++;//增加一次资源加载次数
              if( typeof (_callback)==="function" ) _callback();
            }
          };
        }
      }
      else{
        if( typeof (_callback)==="function" ){
          _callback(); //回调，执行下一个引用
        }
      }
    };//加载css
    let writeJs=function(_url,_text){
      //if(document.getElementsByTagName('HEAD').length===0) requestAnimationFrame(()=>writeJs(_url,_text));
      if( min!=="" ){
        Function(_text)();//隐藏代码
        return false;
      }
      let head=document.getElementsByTagName('HEAD').item(0);
      let thisTag=document.createElement("script");
      setAttribute(thisTag,_url.split("|").splice(1));//用于js标签自定义属性，例如_url=?id=888|data-value=999这类的属性定义
      thisTag.setAttribute("type","text/javascript");
      thisTag.setAttribute("data-name",_url.split("|")[0].replace(".js","")+min);
      thisTag.innerHTML=_text;
      head.appendChild(thisTag);
    };//往页面写入js
    let writeCss=function(_url,_text){
      if( document.getElementsByTagName('HEAD').length===0 ) return false;
      let head=document.getElementsByTagName('HEAD').item(0);
      let thisTag;
      if( that.multiLoad ){
        thisTag=document.getElementsByTagName('style').item(0);
        if( thisTag ){
          thisTag.innerHTML+=_text;
          return false;
        }
      }
      thisTag=document.createElement("style");
      setAttribute(thisTag,_url.split("|").splice(1));
      thisTag.setAttribute("type","text/css");
      thisTag.setAttribute("data-name",_url.split("|")[0].replace(".css","")+min);
      thisTag.innerHTML=_text;
      head.appendChild(thisTag);
    };//往页面写入css
    let linkJs=function(_url){
      if( document.getElementsByTagName('HEAD').length===0 ) return false;
      let head=document.getElementsByTagName('HEAD').item(0);
      let thisTag=document.createElement("script");
      //link.type="text/javascript";
      setAttribute(thisTag,_url.split("|").splice(1));
      thisTag.src=_url.indexOf("http")===0 ? _url.split("|")[0] : _url.split("|")[0].replace(".js","")+min+".js?"+cacheVersion;
      head.appendChild(thisTag);
    };//往页面引入js
    let linkCss=function(_url){
      if( document.getElementsByTagName('HEAD').length===0 ) return false;
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
    let writeThese=function(_modules,_fileType){//_fileType为小写
      let cacheKey;
      let writeCode={
        "JS":writeJs,
        "CSS":writeCss
      }[_fileType.toUpperCase()];
      let code=_modules.map((_k)=>{
        cacheKey=(that.dataDir+_fileType+min+'/'+_k.replace(/(\.js)|(\.css)/g,"")+min).replace(/\./g,'_');
        return getCache(cacheKey);
      }).join(_fileType==='js' ? ';' : ' ');
      writeCode(_modules.length===1 ? _modules[0] : _fileType+'_'+cacheVersion,code);
    };
    let showLoadCount=function(){
      let thisDuration=new Date().getTime()-startTime;
      _global.headLoaderHistory=typeof (_global.headLoaderHistory)!=="undefined" ? _global.headLoaderHistory : [];//用于统计当前框架共加载文件的总时长
      if( typeof _global.showLoadCountTimeout!=="undefined" ) clearTimeout(_global.showLoadCountTimeout);
      _global.showLoadCountTimeout=setTimeout(()=>{
        if( mediaLength>0 ) _global.headLoaderHistory=_global.headLoaderHistory.concat(new Array(mediaLength-1).fill(0),thisDuration);
        let durationCount=0,avg=0;//有效加载历史的总时间
        if( _global.headLoaderHistory.length>0 ){
          durationCount=_global.headLoaderHistory.reduce((_v,_c)=>_v+_c);
          avg=Math.ceil(durationCount/_global.headLoaderHistory.length);
        }
        console.log('当前页面使用headLoader'+(that.multiLoad ? "并行" : "串行")+'网络请求%c'+mediaLength+'个%cJS/CSS文件，程序用时%c'+thisDuration+'毫秒%c，累计网络请求%c'+_global.headLoaderHistory.length+'个%cJS/CSS文件，单文件平均用时%c'+avg+'毫秒','color:#1b8884','','color:#1b8884','','color:#1b8884','','color:#1b8884','');
      },3000);
    };
    let loadThese=function(_modules,_fileType,_callback){
      if( document.getElementsByTagName('HEAD').length===0 ) return false;
      if( ! _modules || _modules.length===0 ){
        if( typeof (_callback)==="function" ) _callback.call(false);
        return false;
      }
      let loadCode={
        "JS":loadJs,
        "CSS":loadCss
      }[_fileType.toUpperCase()];
      //if(navigator.appName==="Microsoft Internet Explorer"&&parseInt(navigator.appcacheVersion.split(";")[1].replace("MSIE",""))<9&&_fileType==="JS" ) modules.splice(0,0,"html5shiv");//IE版本小于9
      let oneByOne=function(){
        let i=0;
        let runThis=function(){
          if( i>=_modules.length ){
            if( typeof (_callback)==="function" ) _callback.call(false);
          }
          else{
            loadCode(_modules[i],()=>{
              writeThese([_modules[i]],_fileType);
              i++;
              runThis();
            });
          }
        };
        runThis();
      };//串行
      let promiseAll=function(){
        if( ! _modules || _modules.length===0 ){
          if( typeof (_callback)==="function" ) _callback.call(false);
          return false;
        }
        let promises=new Array(_modules.length).fill(0).map((v,i)=>new Promise(function(_resolve){
          loadCode(_modules[i],()=>_resolve("success"));
        }));
        Promise.all(promises).then(()=>{
          if( _modules.length!==0 ) writeThese(_modules,_fileType);
          if( typeof (_callback)==="function" ) _callback.call(false);
        });
      };//并行
      (that.multiLoad ? promiseAll : oneByOne)();//线上并行，线下串行（可调试）
    };//加载
    let thisHex=new hex();
    this.run=function(){
      that.dataCss=standardized(that.dataCss.join(",").replace(/_css/g,modDir).split(","));
      that.dataJs=standardized(that.dataJs.join(",").replace(/_js/g,modDir).split(","));
      cacheVersion=getCacheVersion();
      mediaCacheVersion=getCacheVersion(24);//不论什么环境css文件中的静态文件缓存24小时更新一次,例如图片,字体等
      let loadAllCallback=function(){
        if( that.showLoadCount ) showLoadCount();
        if( typeof (that.callback)==="function" ) that.callback.call(false);
      };
      let loadCssCallback=function(){ loadThese(that.dataJs,"js",loadAllCallback);};
      loadThese(that.dataCss,"css",loadCssCallback);//先加载dataCss，后加载dataJs
    };
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
    if( allScript[i].hasAttribute("src") && allScript[i].getAttribute("src").indexOf(atob("aGVhZExvYWRlci4="))>=0 ){
      thisScript=allScript.item(i);
      break;
    }
  }
  if( ! thisScript ){
    if( console.log ) console.log("%c"+decodeURIComponent(atob("JUU5JTk0JTk5JUU4JUFGJUFGJUU2JThGJTkwJUU3JUE0JUJBJTNBJUU3JUE4JThCJUU1JUJBJThGJUU2JTlDJUFBJUU2JTg4JTkwJUU1JThBJTlGJUU2JTg5JUE3JUU4JUExJThDJTJDJUU2JThGJTkyJUU0JUJCJUI2JUU1JTkwJThEJUU3JUE3JUIwJUU0JUI4JUJBaGVhZExvYWRlci5qcyVFNiU4OCU5NiVFOCU4MCU4NWhlYWRMb2FkZXIubWluLmpzJUU2JUIzJUE4JUU2JTg0JThGJUU1JUE0JUE3JUU1JUIwJThGJUU1JTg2JTk5LiVFNSVBNiU4MiVFNiU5QyU4OSVFNyU5NiU5MSVFOSU5NyVBRSVFOCVBRiVCNyVFOCVBRSVCRiVFOSU5NyVBRSUzQWh0dHBzJTNBJTJGJTJGZ2l0aHViLmNvbSUyRmJhaXl1a2V5JTJGaGVhZExvYWRlcg==")),"color:#F00");
    return false;
  }
  let reLog=console.log && thisScript.getAttribute("src").indexOf(".min")<0;
  let staticDir=location.pathname.split("/")[1]==="static" ? "/static" : "/";
  let modDir=location.pathname.replace(staticDir,"").replace(".html","");
  if( location.pathname.replace(/.*\//,"").replace(".html","")==="" ) modDir+="index";
  modDir=modDir.indexOf("/")===0 ? modDir.substr(1) : modDir;
  if( thisScript.hasAttribute("data-update-cacheVersion") ){
    update=thisScript.getAttribute("data-update-cacheVersion");
  }
  else{
    if( reLog ) console.log('%c友情提示:script标签无"data-update-cacheVersion"属性,默认为false.',"color:#69F;");
  }
  if( thisScript.hasAttribute("data-dir") ){
    dataDir=thisScript.getAttribute("data-dir");
  }
  else{
    if( reLog ) console.log('%c友情提示:script标签无"data-dir"属性.',"color:#69F;");
  }
  if( thisScript.hasAttribute("data-css") ){
    dataCss=thisScript.getAttribute("data-css").split(",");//.replace(/_css/g,modDir);
  }
  else{
    if( reLog ) console.log('%c友情提示:script标签无"data-css"属性',"color:#69F;");
  }
  if( thisScript.hasAttribute("data-js") ){
    dataJs=thisScript.getAttribute("data-js").split(",");//.replace(/_js/g,modDir);
  }
  else{
    if( reLog ) console.log('%c友情提示:script标签无"data-js"属性',"color:#69F;");
  }
  if( allScript.length>0 && min!=="" ) allScript.item(0).remove(); //线上环境隐藏headLoader.js
  let thisLoader=new headLoader();
  if( dataDir ) thisLoader.dataDir=dataDir;
  thisLoader.dataCss=dataCss;
  thisLoader.dataJs=dataJs;
  //thisLoader.showLoadCount=true;//是否显示统计
  thisLoader.run();
})(window.location.origin===window.top.location.origin ? window.top : window);
