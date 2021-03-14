/**
 * headLoader用于加载、预加载及缓存网站资源，实现网站快速响应，优化服务器请求的目的。使用纯前端技术，基本上用"0成本"就能使普通的网站得到明显的加速效果。
 * localDB用于对indexDB增删改查的操作，主要配合headLoader缓存资源，当然也可以单独使用
 * @global : headLoader,localDB
 * @author: 宇哥 baiyukey@qq.com
 * @param {String} [this.dataDir] -资源路径
 * @param {Array} [this.dataCss] -CSS模块列表
 * @param {Array} [this.dataJs] -JS资源路径
 * @param {Number} [this.dataLifecycle=2] -缓存生成周期，单位小时，默认2
 * @param {Boolean} [this.dataActive=false] -是否自动切换线上与线下代码路径，默认否
 * @param {Function} [this.callback=null] -所有资源加载完成后的回调函数 (仅命令行模式可用)
 * @param {Boolean} [this.showLog=false] -是否显示加载统计(仅命令行模式可用)
 * @param {Number} [this.preload=0] -预加载开关(仅命令行模式可用) 1:预加载打开(不应用于当前页面)，0:预加载关闭（加载后立即应用于当前页面）。 默认0 。
 * @link : https://github.com/baiyukey/headLoader
 * @version : 2.0.93
 * @copyright : http://www.uielf.com
 */
let headLoader,localDB;
(function(_global){
  let XHR=new Function();
  if(_global.XMLHttpRequest){
    XHR=_global.XMLHttpRequest;
  }
  else if(_global.ActiveXObject){
    XHR=_global.ActiveXObject("Microsoft.XMLHTTP");
  }
  else return alert('浏览器不支持XMLHttpRequest，请使用现代浏览器，例如chrome等。');
  let min=/^((192\.168|172\.([1][6-9]|[2]\d|3[01]))(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}|10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3})|(localhost)$/.test(_global.location.hostname) ? "" : ".min";//直接返回"min"时将无缓存机制
  let getVersion=function(_hours){
    let newTime=new Date().getTime()+28800000;//new Date(0) 相当于 1970/1/1 08:00:00
    let stepTime=_hours>0 ? 1000*60*60*_hours : 1;//默认1970年以来每_hours个小时为一个值
    return String(new Date(newTime-newTime%stepTime+stepTime).getTime()-28800000);
  };
  let hex=function(){
    let bet="";
    for(let i=48; i<=122; i++){
      if((i>=58 && i<=64) || (i>=91 && i<=96)) continue;
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
  let thisHex=new hex();
  localDB=function(_option){
    /**
     * 通过indexedDB创建站点缓存仓库
     * @param {String} [_option.database] 缓存仓库名称
     * @param {Function} [_option.version] 获取动态数据版本号
     * @param {Object} [_option.tables] 表及字段名称,例如{js:["key","value","version"],...}
     */
    let option={
      database:"localDB",
      tables:{
        //        js:["key","value","version"],
        //        css:["key","value","version"],
        //        font:["key","value","version"],
        //        icon:["key","value","version"],
        //        image:["key","value","version"],
        //        video:["key","value","version"],
        data:["key","value","version"]
      },
      version:getVersion(min===".min" ? 24 : 0)
    };
    Object.assign(option,_option);
    _global.localDBResult=_global.localDBResult || null;
    //_global.localDBResult的状态 0:关闭，1:打开
    _global.localDBStatus=_global.localDBStatus || 0;
    const dbAble=function(){
      if(_global.indexedDB || _global.webkitIndexedDB || _global.mozIndexedDB || _global.msIndexedDB) return true;
      console && console.log("您的浏览器不支持indexedDB，请使用现代浏览器，例如chrome,firefox等.");
      return false;
    };
    const openDB=function(){
      if(typeof (_global.waitCloseLocalDB)!=="undefined") clearTimeout(_global.waitCloseLocalDB);
      return new Promise((_resolve,_reject)=>{
        if(_global.localDBResult!==null && _global.localDBStatus===1){
          //if(reLog) console.log(`${option.database}不必重复打开`);
          _resolve("success");
          return;
        }
        let request=_global.indexedDB.open(option.database); //建立打开 indexedDB
        request.onerror=function(_e){
          _reject(_e);
        };
        request.onsuccess=function(_e){
          _global.localDBResult=request.result;
          _global.localDBStatus=1;
          //if(reLog) console.log(`${option.database}已打开`);
          _resolve(_e);
        };
        request.onupgradeneeded=function(_e){
          _global.localDBResult=_e.target.result;
          _global.localDBStatus=1;
          let tableNames=Object.keys(option.tables);
          for(const _tableName of tableNames){
            if(!_global.localDBResult.objectStoreNames.contains(_tableName)){
              //创建表，声明主键字段名为key
              let objectStore=_global.localDBResult.createObjectStore(_tableName,{keyPath:"key"});
              //非关系型数据库的特点，表中的每个字段存为一个子表，美其名曰“索引”(createIndex)
              //在往子表里加数据时只需增加到Value字段,所以Key字段的值引用Value中的某个属性值即可，也可以让它自动生成
              //createIndex3个参数：主键，索引属性，主键是否唯一
              option.tables[_tableName].forEach(_c=>objectStore.createIndex(_c,["key"],{unique:true}));
            }
          }
          _e.target.transaction.oncomplete=()=>_resolve(_global.localDBResult);
        };
      });
    };
    const closeDB=function(_waitTime){
      if(typeof (_global.waitCloseLocalDB)!=="undefined") clearTimeout(_global.waitCloseLocalDB);
      return new Promise((_resolve,_reject)=>{
        let runThis=function(){
          if(_global.localDBStatus===0){
            _resolve("success");
            return;
          }
          if(_global.localDBResult!==null) _global.localDBResult.close();
          _global.localDBStatus=0;
          //if(reLog) console.log(`${option.database}已关闭`);
          _resolve("success");
        };
        _global.waitCloseLocalDB=setTimeout(runThis,_waitTime || 3000);
      });
    };
    const deleteDB=async function(){
      if(!_global.localDBResult) return console.warn(`目前还没有库${option.database}`);
      await closeDB(0);
      _global.indexedDB.deleteDatabase(option.database);
      if(reLog) console.log(`${option.database}已删除`);
    };
    /**
     * 定义某条数据
     * @return new Promise()
     */
    const setItem=function(){
      //如果数据key已存在，覆盖原有数据，否则写入
      let defaultArgument={
        tableName:'data',
        key:'',//主键
        value:null,//读取文件获取的内容
        etag:''//读取文件后从服务器返回的etag，用于后续判断文件是否更改
      };
      if(typeof (arguments[0])==="object"){
        /*例如：
         setItem({
         tableName:'data',//可省略，默认data
         key:'/a/color.css',
         value:'a{color:red}',
         etag:""
         })
         */
        Object.assign(defaultArgument,arguments[0]);
      }
      else{
        //简写时只有两个参数，_key,_value
        //例如：setItem("/a/color.css",'a{color:red}')
        defaultArgument.key=arguments[0] || defaultArgument.key;
        defaultArgument.value=arguments[1] || defaultArgument.value;
      }
      return new Promise(async(_resolve,_reject)=>{
        await openDB();
        let thisData={
          key:(min===".min" ? thisHex.encode(defaultArgument.key) : defaultArgument.key),
          value:defaultArgument.value,
          etag:defaultArgument.etag,
          version:option.version
        };
        let method="add";
        await getItem(defaultArgument.key).then(_v=>{
          method=_v ? "put" : "add";
        }).catch(_v=>{
          method="add";
        });
        let thisTable=_global.localDBResult.transaction(defaultArgument.tableName,"readwrite").objectStore(defaultArgument.tableName);
        let setData=thisTable[method](thisData);
        setData.onsuccess=function(){
          //console.log(`${thisData.key}数据(${method})${method==="add" ? "写入" : "更新"}成功`);
          _resolve(thisData);
        };
        setData.onerror=_e=>_reject(_e);
      });
    };
    /**
     * 获取某条数据
     * @param {String} [_key] -键名
     * @param {String} [_tableName] -表名 可选，默认“data”
     * @return new Promise()
     */
    const getItem=function(_key,_tableName){
      return new Promise(async(_resolve,_reject)=>{
        await openDB();
        let tableName=_tableName || "data";
        let table=_global.localDBResult.transaction(tableName,'readonly').objectStore(tableName);
        let list=table.index('key');
        let keyName=(min===".min" ? thisHex.encode(_key) : _key);
        let request=list.get(IDBKeyRange.only([keyName]));
        request.onsuccess=_e=>_resolve(_e.target.result);//[注意！！！]_e.target.result有可能会返回undefined
        request.onerror=_e=>_reject(_e);
      });
    };
    if(dbAble){
      this.open=openDB;
      this.close=closeDB;
      this.delete=deleteDB;
      this.setItem=setItem;
      this.getItem=getItem;
    }
  };
  //_global.localDB=localDB;
  headLoader=function(_val){
    let val=_val || {};
    this.dataDir=val.dataDir || "";
    this.dataCss=val.dataCss || [];
    this.dataJs=val.dataJs || [];
    this.dataFont=val.dataFont || [];
    this.dataHtml=val.dataHtml || [];
    this.dataLifecycle=val.dataLifecycle || dataLifecycle; //Number | 缓存代码的生命周期，单位小时，默认24 | 可选项
    this.dataActive=val.dataActive || dataActive; //Boolean | 是否自动切换线上与线下代码路径，默认false | 可选项
    this.callback=val.callback || null;//Function | 加载完成后的回调函数 | 可选项
    this.multiLoad=val.multiLoad || (min===".min");//默认线上并行加载
    this.showLog=val.showLog || false;//默认不显示加载统计
    this.preload=typeof (val.preload)!=="undefined" ? val.preload : 0;//是否是预加载，预加载不应用于当前页面
    let that=this;//关键字避嫌
    let isLink=(_thisMode)=>_thisMode.indexOf("http://")===0 || _thisMode.indexOf("https://")===0;
    let standardized=function(_arr,_type){
      let reArr=[];
      let thisStr="";
      for(let i=0; i<_arr.length; i++){
        thisStr=_arr[i].replace(/^(\s*)|(\s*)$/g,"").replace(new RegExp(`(.${_type})$`),"");//去前后空格及扩展名
        if(thisStr.length!==0 && reArr.indexOf(thisStr)<0) reArr.push(thisStr);//去重
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
      _global["headLoaderCache"]={};
    }
    let getUrl=function(_module,_type,_ext){
      if(that.dataActive && ["js","css"].includes(_type)) return (`${that.dataDir}${_type}${min}/${_module.split("|")[0]}`.replace("."+(_ext || _type),"")+min)+"."+(_ext || _type);//.js不一定是最后的字符
      return `${that.dataDir}${_module.split("|")[0]}.${_ext || _type}`;
    };
    let getCacheKey=function(_module,_type){
      if(["js","css"].includes(_type)) return ((that.dataDir+_type+min+'/'+_module.split("|")[0]).replace("."+_type,"")+min)+"."+_type;
      return (that.dataDir+_module.split("|")[0])+"."+_type;//.replace("."+_type,"");//html
    };
    //获取文件头信息
    let getEtag=function(url){
      return new Promise((_r,_rj)=>{
        let xhr=new XHR();
        xhr.open("HEAD",url,true);
        xhr.send();
        xhr.onreadystatechange=function(){
          if(Number(xhr.readyState)===4 && Number(xhr.status)===200){
            //文件修改后etag会变化
            _r(xhr.getResponseHeader("etag") || xhr.getResponseHeader("last-modified") || "");
          }
        };
        xhr.onerror=_e=>_rj(_e);
      });
    };
    //获取文件缓存状态值，判断是否已经过期
    let getStatus=function(_value,_url){
      return new Promise((_r,_rj)=>{
        //0：缓存未到期
        //1：缓存已到期，但服务器文件未变化，继续使用缓存
        //2：缓存已到期或不存在，需要从服务器获取
        if(!_value) return _r(2);
        if(_value.version!==that.requestVersion){//缓存过期
          //先读取文件头的etag判断文件是否已修改
          if(_value.etag==="") _r(2);
          else{
            getEtag(_url).then(_v=>{
              if(_value.etag===_v) _r(1);
              else _r(2);
            }).catch(_v=>_rj(_v));
          }
        }
        else{
          _r(0);
        }
      });
    };
    let loadXHR=function(_module,_fileType){
      return new Promise(_r=>{
        if(isLink(_module)){
          if(_fileType==="js") linkJs(_module);
          else if(_fileType==="css") linkCss(_module);
          return _r("success");
        }
        let url=getUrl(_module,_fileType)+"?v="+that.requestVersion;//.js不一定是最后的字符
        let cacheKey=getCacheKey(_module,_fileType);
        let runThis=async function(_io,_value){
          let value=_value;
          if(_io===0){//0：缓存未到期
            _r("success");
          }
          else if(_io===1){//1：缓存已到期，但服务器文件未变化，更新缓存版本继续使用
            //setCache(cacheKey,value);
            await that.db.setItem({
              "key":cacheKey,
              "value":value.value,
              "etag":value.etag
            });
            _r("success");
          }
          else if(_io===2){//2：缓存已到期或不存在，需要从服务器获取
            let xhr=new XHR();
            xhr.open("GET",url,true);
            xhr.send();
            xhr.onreadystatechange=async function(){
              if(Number(xhr.readyState)===4 && Number(xhr.status)===200){
                let content=xhr.responseText || "";
                if(_fileType==="css"){
                  //content=content.replace(/\[dataDir]/g,that.dataDir); //css文件的动态路径需单独处理
                  content=content.replace(/\[v]/g,that.requestVersion);
                }
                //注意某些服务器不会返回etag或者last-modified
                await that.db.setItem({
                  "key":cacheKey,
                  "value":content,
                  "etag":xhr.getResponseHeader("etag") || xhr.getResponseHeader("last-modified") || ""
                });
                if(that.showLog) mediaLength++;//增加一次资源加载次数
                _r("success");
              }
            };
          }
        };
        that.db.getItem(cacheKey).then((_value)=>{
          getStatus(_value,url).then(_status=>runThis(_status,_value)).catch(_err=>console.error(_err));
        });
      });
    };//XHR类型加载器
    let loadFont=function(_module){
      //FontFace目前属于实验功能
      return new Promise(async _r=>{
        let url=getUrl(_module,"fonts","woff")+"?v="+that.requestVersion;
        if(typeof (FontFace)!=="function") return new Promise(_resolve=>_resolve("success"));
        const newFont=new FontFace("elfRound","url("+url+")");
        await newFont.load();
        document.fonts.add(newFont);
        _r("success");
      });
    };//加载font
    let writeJs=function(_url,_text){
      //if(document.getElementsByTagName('HEAD').length===0) requestAnimationFrame(()=>writeJs(_url,_text));
      if(min!==""){
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
      if(document.getElementsByTagName('HEAD').length===0) return false;
      let head=document.getElementsByTagName('HEAD').item(0);
      let thisTag;
      if(that.multiLoad){
        thisTag=document.getElementsByTagName('style').item(0);
        if(thisTag){
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
      if(document.getElementsByTagName('HEAD').length===0) return false;
      let head=document.getElementsByTagName('HEAD').item(0);
      let thisTag=document.createElement("script");
      //link.type="text/javascript";
      setAttribute(thisTag,_url.split("|").splice(1));
      thisTag.src=_url.indexOf("http")===0 ? _url.split("|")[0] : _url.split("|")[0].replace(".js","")+min+".js?v="+that.requestVersion;
      head.appendChild(thisTag);
    };//往页面引入js
    let linkCss=function(_url){
      if(document.getElementsByTagName('HEAD').length===0) return false;
      let head=document.getElementsByTagName('HEAD').item(0);
      let thisTag=document.createElement("link");
      setAttribute(thisTag,_url.split("|").splice(1));
      thisTag.type="text/css";
      thisTag.rel="stylesheet";
      thisTag.media="screen";
      thisTag.href=_url.indexOf("http")===0 ? _url.split("|")[0] : _url.split("|")[0].replace(".css","")+min+".css?v="+that.requestVersion;
      head.appendChild(thisTag);
    };//往页面引入css
    let writeThese=async function(_modules,_fileType){//_fileType为小写
      return new Promise((_resolve,_reject)=>{
        let cacheKey;
        let writeCode={
          "JS":writeJs,
          "CSS":writeCss
        }[_fileType.toUpperCase()];
        if(!writeCode) return _resolve("页面写入仅支持js、css.");
        let code={};
        let Promises=[];
        _modules.forEach((_k)=>{
          code[_k]='';
          let runThis=function(_resolve,_reject){
            cacheKey=getCacheKey(_k,_fileType);//(that.dataDir+_fileType+min+'/'+_k.replace(/(\.js)|(\.css)/g,"")+min);
            //getCache(cacheKey).then(_v=>code.push(_v));
            that.db.getItem(cacheKey).then((_value)=>{
              code[_k]=_value.value;
              _resolve(true);
            }).catch(_err=>_reject(_err));
          };
          Promises.push(new Promise(runThis));
        });
        Promise.all(Promises).then(()=>{
          writeCode(_modules.length===1 ? _modules[0] : _fileType+'_'+that.requestVersion,Object.values(code).join(_fileType==='js' ? ';' : ' '));
          _resolve("success");
        }).catch(_err=>_reject(_err));
      });
    };
    let logData=function(){
      let thisDuration=new Date().getTime()-startTime;
      _global.headLoaderHistory=typeof (_global.headLoaderHistory)!=="undefined" ? _global.headLoaderHistory : [];//用于统计当前框架共加载文件的总时长
      if(typeof _global.showLogTimeout!=="undefined") clearTimeout(_global.showLogTimeout);
      _global.showLogTimeout=setTimeout(()=>{
        if(mediaLength>0) _global.headLoaderHistory=_global.headLoaderHistory.concat(new Array(mediaLength-1).fill(0),thisDuration);
        let durationCount=0,avg=0;//有效加载历史的总时间
        if(_global.headLoaderHistory.length>0){
          durationCount=_global.headLoaderHistory.reduce((_v,_c)=>_v+_c);
          avg=Math.ceil(durationCount/_global.headLoaderHistory.length);
        }
        console.log('当前页面使用headLoader'+(that.multiLoad ? "并行" : "串行")+'网络请求%c'+mediaLength+'个%cJS/CSS文件，程序用时%c'+thisDuration+'毫秒%c，累计网络请求%c'+_global.headLoaderHistory.length+'个%cJS/CSS文件，单文件平均用时%c'+avg+'毫秒','color:#1b8884','','color:#1b8884','','color:#1b8884','','color:#1b8884','');
      },3000);
    };
    let loadThese=function(_modules,_fileType){
      if(document.getElementsByTagName('HEAD').length===0) return false;
      if(!_modules || _modules.length===0){
        return new Promise(_resolve=>_resolve("success"));
      }
      let load={
        "JS":loadXHR,
        "CSS":loadXHR,
        "FONT":loadFont,
        "HTML":loadXHR
      }[_fileType.toUpperCase()];
      //if(navigator.appName==="Microsoft Internet Explorer"&&parseInt(navigator.appthat.requestVersion.split(";")[1].replace("MSIE",""))<9&&_fileType==="JS" ) modules.splice(0,0,"html5shiv");//IE版本小于9
      let oneByOne=async function(_resolve){
        let i=0;
        let runThis=async function(){
          if(i>=_modules.length){
            return true;
          }
          else{
            await load(_modules[i],_fileType);
            if(that.preload===0) await writeThese([_modules[i]],_fileType);
            i++;
            await runThis();
          }
        };
        await runThis();
        _resolve("success");
      };//串行
      let promiseAll=function(_resolve){
        if(!_modules || _modules.length===0){
          _resolve("success");
        }
        let promises=new Array(_modules.length).fill(0).map((v,i)=>new Promise(async function(_resolve){
          await load(_modules[i],_fileType);
          _resolve("success");
        }));
        Promise.all(promises).then(async()=>{
          if(_modules.length!==0 && that.preload===0) await writeThese(_modules,_fileType);
          _resolve("success");
        });
      };//并行
      return new Promise(that.multiLoad ? promiseAll : oneByOne);//线上并行，线下串行（可调试）
    };//加载
    this.requestVersion=getVersion(this.dataLifecycle && this.dataLifecycle>0 ? this.dataLifecycle : (min===".min" ? 2 : 0));
    this.db=new localDB({version:this.requestVersion});
    this.run=function(){
      that.dataCss=standardized(that.dataCss.join(",").replace(/_css/g,modDir).split(","),"css");
      that.dataJs=standardized(that.dataJs.join(",").replace(/_js/g,modDir).split(","),"js");
      that.dataFont=standardized(that.dataFont,"");
      that.dataHtml=standardized(that.dataHtml,"html");
      (async function(){
        await that.db.open();
        //先加载dataCss，后加载dataJs
        await loadThese(that.dataCss,"css");
        await loadThese(that.dataFont,"font");
        await loadThese(that.dataJs,"js");
        await loadThese(that.dataHtml,"html");
        if(that.showLog) logData();
        if(typeof (that.callback)==="function") that.callback.call(false);
        await that.db.close();
      })();
      //console.timeEnd(ct);
    };
  };
  //_global.headLoader=headLoader;
  //_global.headLoader=_global.headLoader ? _global.headLoader : headLoader;
  let allScript=document.getElementsByTagName("script");
  let thisScript;
  let dataJs=[],
    dataCss=[],
    dataFont=[],
    dataHtml=[];
  let dataDir;
  let dataActive=false;//是否自动切换线上与线下代码路径，默认否
  let dataLifecycle;//缓存周期
  let mediaLength=1;//文件个数，用于统计页面加载多少个文件
  let startTime=new Date().getTime();//开始时间，用于统计页面加载时长
  for(let i=0; i<allScript.length; i++){
    if(allScript[i].hasAttribute("src") && allScript[i].getAttribute("src").indexOf(atob("aGVhZExvYWRlci4="))>=0){
      thisScript=allScript.item(i);
      break;
    }
  }
  if(!thisScript){
    if(console.log) console.log("%c"+decodeURIComponent(atob("JUU5JTk0JTk5JUU4JUFGJUFGJUU2JThGJTkwJUU3JUE0JUJBJTNBJUU3JUE4JThCJUU1JUJBJThGJUU2JTlDJUFBJUU2JTg4JTkwJUU1JThBJTlGJUU2JTg5JUE3JUU4JUExJThDJTJDJUU2JThGJTkyJUU0JUJCJUI2JUU1JTkwJThEJUU3JUE3JUIwJUU0JUI4JUJBaGVhZExvYWRlci5qcyVFNiU4OCU5NiVFOCU4MCU4NWhlYWRMb2FkZXIubWluLmpzJUU2JUIzJUE4JUU2JTg0JThGJUU1JUE0JUE3JUU1JUIwJThGJUU1JTg2JTk5LiVFNSVBNiU4MiVFNiU5QyU4OSVFNyU5NiU5MSVFOSU5NyVBRSVFOCVBRiVCNyVFOCVBRSVCRiVFOSU5NyVBRSUzQWh0dHBzJTNBJTJGJTJGZ2l0aHViLmNvbSUyRmJhaXl1a2V5JTJGaGVhZExvYWRlcg==")),"color:#F00");
    return false;
  }
  let reLog=console.log && min!==".min";
  let modDir=location.pathname.replace(".html","");
  if(location.pathname.replace(/.*\//,"").replace(".html","")==="") modDir+="index";
  modDir=modDir.indexOf("/")===0 ? modDir.substr(1) : modDir;
  if(thisScript.hasAttribute("data-active")){
    dataActive=["true",""].includes(thisScript.getAttribute("data-active"));
  }
  else{
    if(reLog) console.log(`%c友情提示:script标签未设置"data-active"属性,默认为false.`,"color:#69F;");
  }
  if(thisScript.hasAttribute("data-lifecycle")){
    dataLifecycle=Number(thisScript.getAttribute("data-lifecycle"));
  }
  else{
    if(reLog) console.log(`%c友情提示:script标签未设置"data-lifecycle"属性,默认为0(开发环境)或24小时(线上环境）.`,"color:#69F;");
  }
  if(thisScript.hasAttribute("data-dir")){
    dataDir=thisScript.getAttribute("data-dir");
  }
  else{
    if(reLog) console.log('%c友情提示:script标签未设置"data-dir"属性.',"color:#69F;");
  }
  if(thisScript.hasAttribute("data-css")){
    dataCss=thisScript.getAttribute("data-css").split(",");//.replace(/_css/g,modDir);
  }
  else{
    if(reLog) console.log('%c友情提示:script标签未设置"data-css"属性',"color:#69F;");
  }
  if(thisScript.hasAttribute("data-js")){
    dataJs=thisScript.getAttribute("data-js").split(",");//.replace(/_js/g,modDir);
  }
  else{
    if(reLog) console.log('%c友情提示:script标签未设置"data-js"属性',"color:#69F;");
  }
  if(thisScript.hasAttribute("data-font")){
    dataFont=thisScript.getAttribute("data-font").split(",");//.replace(/_js/g,modDir);
  }
  if(thisScript.hasAttribute("data-html")){
    dataHtml=thisScript.getAttribute("data-html").split(",");//.replace(/_js/g,modDir);
  }
  else{
    if(reLog) console.log('%c友情提示:script标签未设置"data-js"属性',"color:#69F;");
  }
  if(allScript.length>0 && min!=="") allScript.item(0).remove(); //线上环境隐藏headLoader.js
  let thisLoader=new headLoader();
  if(dataDir) thisLoader.dataDir=dataDir;
  thisLoader.dataCss=dataCss;
  thisLoader.dataJs=dataJs;
  thisLoader.dataFont=dataFont;
  thisLoader.dataHtml=dataHtml;
  thisLoader.dataLifecycle=dataLifecycle;
  thisLoader.showLog=false;//是否显示统计
  thisLoader.run();
})((window.location.origin==="null" || window.location.origin===window.top.location.origin) ? window.top : window);
