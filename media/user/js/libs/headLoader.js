/**
 * headLoader用于加载、预加载及缓存网站资源，实现网站快速响应，优化服务器请求的目的。使用纯前端技术，基本上用"0成本"就能使普通的网站得到明显的加速效果。
 * localDB用于对indexDB增删改查的操作，主要配合headLoader缓存资源，当然也可以单独使用
 * @global : headLoader,localDB
 * @author: 宇哥 baiyukey@qq.com
 * @param {String} [this.dataDir] -资源路径
 * @param {Array} [this.dataCss] -CSS模块列表
 * @param {Array} [this.dataJs] -JS资源路径
 * @param {Array} [this.dataFont] -字体资源路径
 * @param {Array} [this.dataFile] -其它资源路径
 * @param {Number} [this.dataLifecycle=24] -缓存生成周期，单位小时，默认24
 * @param {Boolean} [this.dataActive=false] -是否自动切换线上与线下代码路径，默认否
 * @param {Function} [this.callback=null] -所有资源加载完成后的回调函数 (仅命令行模式可用)
 * @param {Boolean} [this.showLog=false] -是否显示加载统计(仅命令行模式可用)
 * @param {Number} [this.preload=0] -预加载开关(仅命令行模式可用) 1:预加载打开(不应用于当前页面)，0:预加载关闭（加载后立即应用于当前页面）。 默认0 。
 * @link : https://github.com/baiyukey/headLoader
 * @version : 2.1.4
 * @copyright : http://www.uielf.com
 */
let headLoader,localDB;
(function(_global){
  let head=document.getElementsByTagName('HEAD').item(0);
  let error=function(){
    document.body.innerHTML='<div style="text-align:center"><ul style="display:inline-block;margin-top:20px;text-align:left;list-style:none;line-height:32px;"><li style="list-style:none;"><h3>抱歉，您的浏览器不支持运行当前页面！</h3>如下两种方法供您参考：</li><li>✱ 请将您的浏览器切换到 "极速内核" (如果有)。</li><li>✱ <a href="https://www.google.cn/chrome/">或者下载安装 "chrome" 浏览器后重试。</a></li></ul></div>';
  };
  if(!_global.Promise) return _global.onload=error;//所有IE均不支持
  let XHR=_global.XMLHttpRequest;
  let min=/^((192\.168|172\.([1][6-9]|[2]\d|3[01]))(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}|10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3})|(localhost)$/.test(_global.location.hostname) ? "" : ".min";//直接返回"min"时将无缓存机制
  let getVersion=function(_hours){
    let newTime=new Date().getTime()+28800000;//new Date(0) 相当于 1970/1/1 08:00:00
    let stepTime=_hours>0 ? 1000*60*60*_hours : 1;//默认1970年以来每_hours个小时为一个值
    return String(new Date(newTime-newTime%stepTime+stepTime).getTime()-28800000);
  };
  let getType=_=>_.replace(/^.*[\/.]*\.(\w*)[?#]*.*$/,"$1");//url.parse(req.url).ext无法获取错误路径的扩展名
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
      if(_global.indexedDB || _global["webkitIndexedDB"] || _global["mozIndexedDB"] || _global["msIndexedDB"]) return true;
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
        defaultArgument.key=arguments.length>0 ? arguments[0] : defaultArgument.key;
        defaultArgument.value=arguments.length>1 ? (arguments[1]) : defaultArgument.value;
        defaultArgument.tableName=arguments.length>2 ? arguments[2] : defaultArgument.tableName;
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
        await getItem(defaultArgument.key,"data").then(_v=>{
          method=(_v ? "put" : "add");
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
        let result={};
        let searchIndexDB=async function(){
          await openDB();
          let tableName=_tableName || "data";
          let table=_global.localDBResult.transaction(tableName,'readonly').objectStore(tableName);
          let list=table.index('key');
          let keyName=(min===".min" ? thisHex.encode(_key) : _key);
          let request=list.get(IDBKeyRange.only([keyName]));
          request.onsuccess=_e=>{
            result=_e.target.result;
            if(result) Object.assign(result,{"key":_key});
            _resolve(result);
          };//[注意！！！]_e.target.result有可能会返回undefined
          request.onerror=_e=>_reject(_e);
        };
        //先从内存中查找，因为indexDB存取会有延迟
        result=that.temp[_key];
        if(result){
          _resolve(result);
          return true;
        }
        //再从indexDB中查找
        else await searchIndexDB();
      });
    };
    const getValue=async function(_key){
      let thisResult=await getItem(_key);
      return thisResult ? thisResult.value : false;
    }
    const getItemCss=async function(_module,_tableName){
      let module=standardized(_module,"css");
      return await getItem(that.getUrl(module,"css"),_tableName || "data");
    };
    const getItemHtml=async function(_module,_tableName){
      let module=standardized(_module,"html");
      return await getItem(that.getUrl(module,"html"),_tableName || "data");
    };
    const getItemJs=async function(_module,_tableName){
      let module=standardized(_module,"js");
      return await getItem(that.getUrl(module,"js"),_tableName || "data");
    };
    if(dbAble){
      this.open=openDB;
      this.close=closeDB;
      this.delete=deleteDB;
      this.setItem=setItem;
      this.getItem=getItem;
      this.setValue=setItem;
      this.getValue=getValue;
      this.getCss=getItemCss;
      this.getHtml=getItemHtml;
      this.getJs=getItemJs;
      this.temp={};
    }
    let that=this;
  };
  //_global.localDB=localDB;
  let standardized=(_url,_type)=>{
    if(_url && _type) return _url.replace(/^(\s*)|(\s*)$/g,"").replace(`(.${_type})`,``);
    else if(_url && !_type){
      return _url.replace(/^(\s*)|(\s*)$/g,"").replace(`(.${getType(_url)}`,``);
    }
    else{
      return console.error("模块格式错误");
    }
  };
  headLoader=function(_val){
    let val=_val || {};
    this.dataMin=min;
    this.dataDir=val.dataDir || "";
    this.dataCss=val.dataCss || [];
    this.dataJs=val.dataJs || [];
    this.dataFont=val.dataFont || [];
    this.dataFile=val.dataFile || [];
    this.dataLifecycle=this.dataLifecycle && this.dataLifecycle>=0 ? this.dataLifecycle : (min===".min" ? 24 : 0); //Number | 缓存代码的生命周期，单位小时，默认24 | 可选项
    this.dataActive=val.dataActive || dataActive; //Boolean | 是否自动切换线上与线下代码路径，默认false | 可选项
    this.callback=val.callback || null;//Function | 加载完成后的回调函数 | 可选项
    this.multiLoad=val.multiLoad || (min===".min");//默认线上并行加载
    this.showLog=val.showLog || false;//默认不显示加载统计
    this.preload=typeof (val.preload)!=="undefined" ? val.preload : 0;//是否是预加载，预加载不应用于当前页面
    this.requestVersion="";//请求版本,每次run返回一个新的
    let isHttp=_thisMode=>/^http[s]?:\/\//.test(_thisMode);
    let setAttribute=function(_node,_property){
      if(_property.length>0){
        _property.forEach(function(e){
          _node.setAttribute(e.split("=")[0],e.split("=")[`1`]);
        });
      }
    };
    if(typeof _global["headLoaderCache"]==="undefined"){
      _global["headLoaderCache"]={};
    }
    let getUrl=function(_module,_type,_ext){
      //返回例如：/media/js/a.js
      if(that.dataActive && ["js","css"].includes(_type)) return (`${that.dataDir}${_type}${min}/${_module.split("|")[0]}`.replace("."+(_ext || _type),"")+min)+"."+(_ext || _type);//.js不一定是最后的字符
      return _module;
    };
    let getCacheKey=function(_module,_type){
      if(["js","css"].includes(_type)) return ((that.dataDir+_type+min+'/'+_module.split("|")[0]).replace("."+_type,"")+min)+"."+_type;
      return _module;
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
        if(isHttp(_module)){
          if(_fileType==="js") linkJs(_module);
          else if(_fileType==="css") linkCss(_module);
          return _r("success");
        }
        let url=getUrl(_module,_fileType)+(_module.indexOf("?")>=0 ? "&v=" : "?v=")+that.requestVersion;//扩展名不一定是最后的字符
        let cacheKey=getCacheKey(_module,_fileType);
        let getXHR=async function(_io,_value){
          let value={};
          Object.assign(value,{
            "key":cacheKey,
            "value":_value ? _value.value : "",
            "etag":_value ? _value.etag : "",
            "version":_value ? _value.version : that.requestVersion
          });
          if(_io===0){//0：缓存未到期
            that.db.temp[cacheKey]=value;
            _r("success");
          }
          else if(_io===1){//1：缓存已到期，但服务器文件未变化，更新缓存版本继续使用
            //setCache(cacheKey,value);
            that.db.temp[cacheKey]=value;
            _r("success");
            await that.db.setItem(value);
          }
          else if(_io===2){//2：缓存已到期或不存在，需要从服务器获取
            let xhr=new XHR(),fileType=getType(value.key),method="responseText";
            xhr.open("GET",url);
            if(!["js","ts","css","svg","text","xml","json","html","htm"].includes(fileType)){
              xhr.responseType="arraybuffer";
              method="response";
            } //把异步获取类型改为arraybuffer二进制类型
            xhr.send();
            xhr.onreadystatechange=async function(){
              if(Number(xhr.readyState)===4 && Number(xhr.status)===200){
                let content=xhr[method];
                if(_fileType==="css" && content){
                  //content=content.replace(/\[dataDir]/g,that.dataDir); //css文件的动态路径需单独处理
                  content=content.replace(/\[v]/g,that.requestVersion);
                }
                //注意某些服务器不会返回etag或者last-modified
                Object.assign(value,{
                  "value":content,
                  "etag":xhr.getResponseHeader("etag") || xhr.getResponseHeader("last-modified") || ""
                });
                if(that.showLog) mediaLength++;//增加一次资源加载次数
                that.db.temp[cacheKey]=value;
                _r("success");
                await that.db.setItem(value);
              }
            };
          }
        };
        that.db.getItem(cacheKey).then((_value)=>{
          getStatus(_value,url).then(_status=>getXHR(_status,_value)).catch(_err=>console.error(_err));
        });
      });
    };
    let writeJs=function(_codes){
      if(min!==""){
        Function(Object.values(_codes).join(";"))();//隐藏代码
        return false;
      }
      let thisTag=document.createElement("script");
      let thisTagName=Object.keys(_codes).length===1 ? Object.keys(_codes)[0] : "_js"+that.requestVersion;
      //setAttribute(thisTag,thisTagName.split("|").splice(1));//用于js标签自定义属性，例如_url=?id=888|data-value=999这类的属性定义
      thisTag.setAttribute("type","text/javascript");
      thisTag.setAttribute("data-name",thisTagName.split("|")[0].replace(".js","")+min);
      thisTag.innerHTML=Object.values(_codes).join(";");
      head.appendChild(thisTag);
    };//往页面写入js
    let writeCss=function(_codes){
      let thisTag,thisTagName=Object.keys(_codes).length===1 ? Object.keys(_codes)[0] : "_js"+that.requestVersion;
      if(min!==""){
        thisTag=document.getElementsByTagName('style').item(0);
        if(thisTag){
          thisTag.innerHTML+=Object.values(_codes).join(" ");
          return false;
        }
      }
      thisTag=document.createElement("style");
      //setAttribute(thisTag,thisTagName.split("|").splice(1));
      thisTag.setAttribute("type","text/css");
      thisTag.setAttribute("data-name",thisTagName.split("|")[0].replace(".css","")+min);
      thisTag.innerHTML=Object.values(_codes).join(" ");
      head.appendChild(thisTag);
    };//往页面写入css
    let writeFont=async function(_codes){
      Object.keys(_codes).forEach(_key=>{
        document["fonts"].add(new FontFace(_key.replace(/^.*\/|\..*$/g,''),_codes[_key]));
      });
    };
    let linkJs=function(_url){
      if(document.getElementsByTagName('HEAD').length===0) return false;
      let thisTag=document.createElement("script");
      //link.type="text/javascript";
      setAttribute(thisTag,_url.split("|").splice(1));
      thisTag.src=_url.indexOf("http")===0 ? _url.split("|")[0] : _url.split("|")[0].replace(".js","")+min+".js?v="+that.requestVersion;
      head.appendChild(thisTag);
    };//往页面引入js
    let linkCss=function(_url){
      if(document.getElementsByTagName('HEAD').length===0) return false;
      let thisTag=document.createElement("link");
      setAttribute(thisTag,_url.split("|").splice(1));
      thisTag.type="text/css";
      thisTag.rel="stylesheet";
      thisTag.media="screen";
      thisTag.href=_url.indexOf("http")===0 ? _url.split("|")[0] : _url.split("|")[0].replace(".css","")+min+".css?v="+that.requestVersion;
      head.appendChild(thisTag);
    };//往页面引入css
    let writeThese=async function(_modules,_fileType){//_fileType为小写
      if(that.preload===1) return true; //预加载不应用于当前页面
      return new Promise((_resolve,_reject)=>{
        let cacheKey;
        let writeCode={
          "JS":writeJs,
          "CSS":writeCss,
          "FONT":writeFont
        }[_fileType.toUpperCase()];
        if(!writeCode) return _resolve("页面写入仅支持js、css、font");
        let codes={};
        let Promises=[];
        _modules.forEach((_k)=>{
          codes[_k]='';
          let runThis=function(_resolve,_reject){
            cacheKey=getCacheKey(_k,_fileType);//(that.dataDir+_fileType+min+'/'+_k.replace(/(\.js)|(\.css)/g,"")+min);
            codes[_k]=that.db.temp[cacheKey] ? that.db.temp[cacheKey].value : "";
            _resolve("success");
          };
          Promises.push(new Promise(runThis));
        });
        Promise.all(Promises).then(()=>{
          writeCode(codes);
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
    //串行加载
    let serialLoad=function(_modules,_fileType){
      return async(_resolve)=>{
        let i=0;
        let runThis=async function(){
          if(i>=_modules.length){
            return true;
          }
          else{
            await loadXHR(_modules[i],_fileType);
            await writeThese([_modules[i]],_fileType);
            await runThis(i++);
          }
        };
        await runThis();
        _resolve("success");
      };
    };
    //并行加载
    let multiLoad=function(_modules,_fileType){
      return async(_resolve)=>{
        let promises=new Array(_modules.length).fill(0).map((v,i)=>new Promise(async function(_resolve){
          await loadXHR(_modules[i],_fileType);
          _resolve("success");
        }));
        Promise.all(promises).then(async _=>{
          await writeThese(_modules,_fileType);
          _resolve("success");
        });
      };
    };
    let loadThese=function(_modules,_fileType){
      if(document.getElementsByTagName('HEAD').length===0) return false;
      if(!_modules || _modules.length===0){
        return new Promise(_resolve=>_resolve("success"));
      }
      return new Promise(that.multiLoad ? multiLoad(_modules,_fileType) : serialLoad(_modules,_fileType));//线上并行，线下串行（可调试）
    };//加载
    this.requestVersion=getVersion(this.dataLifecycle);
    //indexDB实例
    this.db=new localDB({version:this.requestVersion});
    this.db.temp={};
    this.db.getUrl=getUrl;
    this.run=async function(){
      that.dataCss=that.dataCss.map(_v=>standardized(_v==="_css" ? modDir : _v,"css"));
      that.dataCss=Array.from(new Set(that.dataCss));//去重
      that.dataJs=that.dataJs.map(_v=>standardized(_v==="_js" ? modDir : _v,"js"));
      that.dataJs=Array.from(new Set(that.dataJs));//去重
      that.dataFont=that.dataFont.map(_v=>standardized(_v,""));
      that.dataFont=Array.from(new Set(that.dataFont));//去重
      that.dataFile=that.dataFile.map(_v=>standardized(_v,""));
      that.dataFile=Array.from(new Set(that.dataFile));//去重
      await that.db.open();
      //先加载dataCss，后加载dataJs
      await loadThese(that.dataCss,"css");
      await loadThese(that.dataFont,"font");
      await loadThese(that.dataJs,"js");
      await loadThese(that.dataFile,"");
      if(that.showLog) logData();
      if(typeof (that.callback)==="function") that.callback.call(that,that.db.temp);
      //await that.db.close();
      return Object.keys(that.db.temp).length===0 ? false : that.db.temp;
      //console.timeEnd(ct);
    };
    this.loadItem=async function(_url){
      that.dataFile=[_url].flat();
      return await that.run();
    };
    let that=this;//关键字避嫌
  };
  //_global.headLoader=headLoader;
  //_global.headLoader=_global.headLoader ? _global.headLoader : headLoader;
  let thisScript;
  let dataJs=[],
    dataCss=[],
    dataFont=[],
    dataFile=[];
  let dataDir;
  let dataActive=false;//是否自动切换线上与线下代码路径，默认否
  let dataLifecycle;//缓存周期
  let mediaLength=1;//文件个数，用于统计页面加载多少个文件
  let startTime=new Date().getTime();//开始时间，用于统计页面加载时长
  thisScript=document.currentScript;
  let reLog=console.log && min!==".min";
  let pathname=window===window.top ? location.pathname : window.frameElement.getAttribute("src") || window.frameElement["pathname"] || "/404.html";
  let modDir=pathname.replace(/^(.*\/)(.*)(\.html)([?]*)(.*)$/,"$1$2$4$5");
  if(modDir.substr(-1)==="/") modDir+="index";
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
  if(thisScript.hasAttribute("data-file")){
    dataFile=thisScript.getAttribute("data-file").split(",");//.replace(/_js/g,modDir);
  }
  if(min!=="") thisScript.remove(); //线上环境隐藏headLoader.js
  (async _=>{
    let thisLoader=new headLoader();
    if(dataDir) thisLoader.dataDir=dataDir;
    thisLoader.dataCss=dataCss;
    thisLoader.dataJs=dataJs;
    thisLoader.dataFont=dataFont;
    thisLoader.dataFile=dataFile;
    thisLoader.dataLifecycle=dataLifecycle;
    thisLoader.showLog=false;//是否显示统计
    await thisLoader.run();
  })();
})((window.location.origin==="null" || window.location.origin===window.top.location.origin) ? window.top : window);
