/**
 * headLoader用于加载、预加载及缓存网站资源，实现网站快速响应，优化服务器请求的目的。使用纯前端技术，基本上用"0成本"就能使普通的网站得到明显的加速效果。
 * localDB用于对indexDB增删改查的操作，主要配合headLoader缓存资源，当然也可以单独使用
 * @global : headLoader,hLoader,localDB
 * @author: 宇哥 baiyukey@qq.com
 * @param {String} [this.dataDir] -资源路径
 * @param {Array} [this.dataCss] -CSS模块列表
 * @param {Array} [this.dataJs] -JS资源路径
 * @param {Array} [this.dataFont] -字体资源路径
 * @param {Array} [this.dataFile] -其它资源路径
 * @param {Number} [this.lifeCycle=24] -缓存生成周期，单位小时，默认24
 * @param {Number} [this.cycleDelay=0] -每次缓存延长时间，单位小时，默认0
 * @param {Boolean} [this.dataActive=false] -是否自动切换线上与线下代码路径，默认否
 * @param {Function} [this.callback=null] -所有资源加载完成后的回调函数 (仅命令行模式可用)
 * @param {Boolean} [this.showLog=false] -是否显示加载统计(仅命令行模式可用)
 * @param {Number} [this.preload=0] -预加载开关(仅命令行模式可用) 1:预加载打开(不应用于当前页面)，0:预加载关闭（加载后立即应用于当前页面）。 默认0 。
 * @link : https://github.com/baiyukey/headLoader
 * @version : 2.4.7
 * @copyright : http://www.uielf.com
 */
const headLoaderSource=function(){
  const _global=(window.location.origin==="null" || window.location.origin===window.top.location.origin) ? window.top : window;
  const head=document.getElementsByTagName('HEAD').item(0);
  const error=function(){
    document.body.innerHTML='<div style="text-align:center"><ul style="display:inline-block;margin-top:20px;text-align:left;list-style:none;line-height:32px;"><li style="list-style:none;"><h3>抱歉，您的浏览器不支持运行当前页面！</h3>如下两种方法供您参考：</li><li>✱ 请将您的浏览器切换到 "极速内核" (如果有)。</li><li>✱ <a href="https://www.google.cn/chrome/">或者下载安装 "chrome" 浏览器后重试。</a></li></ul></div>';
  };
  if(!_global.Promise) return _global.onload=error;//所有IE均不支持
  const XHR=_global.XMLHttpRequest;
  const min=/^(((192\.168|172\.([1][6-9]|[2]\d|3[01]))(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}|10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3})|(localhost)|(127.0.0.1))$/.test(_global.location.hostname) ? "" : ".min";//直接返回"min"时将无缓存机制
  const errors={
    0:"网络连接失败。",
    404:"该资源找不到了。",
    500:"无权访问。",
    503:"该请求已被阻止。"
  };
  const getVersion=function(_hours,_delayHours){
    //开发模式直接返回
    if(min==="") return (new Date().getTime());
    let start=new Date("2000/1/1").getTime();
    let plus=Math.ceil((new Date().getTime()-((_delayHours || 0)*1000*60*60)-start)/(1000*60*60*_hours));
    return start+plus*1000*60*60*_hours+(_delayHours || 0)*1000*60*60;
  };
  const getType=_=>_.replace(/^.*\.(\w*)[?#]*.*$/,"$1");//url.parse(req.url).ext无法获取错误路径的扩展名
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
  let localDB=function(_option){
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
    const arrayBufferToBase64=(_buffer,_ext)=>{
      let binary=[];
      let bytes=new Uint8Array(_buffer);
      for(let i=0; i<bytes.byteLength; i++){
        binary.push(String.fromCharCode(bytes[i]));
      }
      return `data:image/${_ext};base64,${window.btoa(binary.join(''))}`;
    };
    const getExt=_=>{
      let thisExt=_.replace(/^.*\.(\w*)[?#]*.*$/,"$1");
      return _!==thisExt ? thisExt : false;
    };
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
              //建立索引（密钥）createIndex3个参数：主键，索引属性，主键是否唯一
              //.createIndex(_c,["key","version"]建立多个索引值，为了以后扩展，用了中括号
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
          _global.localDBResult && _global.localDBResult.close();
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
        defaultArgument.tableName=arguments[2] || defaultArgument.tableName;
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
        setData.onerror=_e=>{
          _reject(_e.target.error);
        };
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
          let keyName=(min===".min" ? thisHex.encode(_key) : _key);
          let list=table.index("key");//获取索引集合
          //从索引中获取数据，索引值在数据库建立时可能是多个，所以这里要用到[]格式,以容纳多个值，但此数据仅一个索引值
          let request=list.get([keyName]);
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
    };
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
    const getItemBase64=async function(_key){
      let thisResult=await getItem(_key);
      if(!thisResult) return false;
      return arrayBufferToBase64(thisResult.value,getExt(_key) || "jpeg");
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
      this.getBase64=getItemBase64;
      this.temp={};
    }
    let that=this;
  };
  _global.localDB=localDB;
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
  let headLoader=function(_val){
    let val=typeof (_val)!=="undefined" ? _val : {};
    this.dataMin=min;
    this.dataDir=val.dataDir || "";
    this.dataCss=val.dataCss || [];
    this.dataJs=val.dataJs || [];
    this.dataFont=val.dataFont || [];
    this.dataFile=val.dataFile || [];
    this.lifeCycle=typeof (val.lifeCycle)==="object" ? val.lifeCycle[0] : (val.lifeCycle || 24);
    this.cycleDelay=typeof (val.lifeCycle)==="object" ? val.lifeCycle[1] : (val.cycleDelay || 0);
    this.dataActive=val.dataActive || dataActive; //Boolean | 是否自动切换线上与线下代码路径，默认false | 可选项
    this.callback=val.callback || null;//Function | 加载完成后的回调函数 | 可选项
    this.multiLoad=val.multiLoad || (min===".min");//默认线上并行加载
    this.showLog=val.showLog || false;//默认不显示加载统计
    this.preload=typeof (val.preload)!=="undefined" ? val.preload : 0;//是否是预加载，预加载不应用于当前页面
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
    let getStatus=function(_data,_url){
      return new Promise((_r,_rj)=>{
        //0：缓存未到期
        //1：缓存已到期，但服务器文件未变化，继续使用缓存
        //2：缓存已到期，服务器文件已修改，需要从服务器获取
        if(!_data) return _r(2);
        if(Number(_data.version)<Number(that.requestVersion)){//缓存过期
          //先读取文件头的etag判断文件是否已修改
          if(_data.etag==="") _r(2);
          else{
            getEtag(_url).then(_v=>{
              if(_data.etag===_v) _r(1);
              else _r(2);
            }).catch(_v=>_rj(_v));
          }
        }
        else{
          _r(0);
        }
      });
    };
    let loadMod=async function(_module,_fileType){
      return new Promise((_r,_ri)=>{
        if(isHttp(_module)){
          if(_fileType==="js") linkJs(_module);
          else if(_fileType==="css") linkCss(_module);
          return _r("success");
        }
        let url=getUrl(_module,_fileType)+(_module.indexOf("?")>=0 ? "&v=" : "?v=")+that.requestVersion;//扩展名不一定是最后的字符
        let cacheKey=getCacheKey(_module,_fileType);
        let getMod=async function(_io,_data){
          let data={};
          Object.assign(data,{
            "key":cacheKey,
            "value":_data ? _data.value : "",
            "etag":_data ? _data.etag : "",
            "version":_data ? _data.version : that.requestVersion
          });
          if(_io===0){//0：缓存未到期
            that.db.temp[cacheKey]=data;
            _r("success");
          }
          else if(_io===1){//1：缓存已到期，但服务器文件未变化，更新缓存版本继续使用
            //setCache(cacheKey,data);
            that.db.temp[cacheKey]=data;
            _r("success");
            data.version=that.requestVersion;
            await that.db.setItem(data);
          }
          else if(_io===2){//2：缓存已到期或已更新，需要从服务器获取
            let fileType=getType(data.key);
            let responseType=["js","ts","css","svg","text","xml","json","html","htm"].includes(fileType) ? "text" : "arraybuffer"; //获取的数据是否是二进制编码条件,例如jpeg类型
            let hasError=function(_status){
              data.version=0;
              data.value={
                code:_status,
                detail:`Error-${_status} ! ${errors[_status] || ""}`
              };
              that.db.temp[cacheKey]=data;
              _r(`${data.key} 返回 ${data.value.detail}`);
            };
            if(window.fetch){
              let response=await fetch(url).catch(_=>hasError(_.name==="TypeError" ? 0 : _.name));
              if(response.ok){
                let content=responseType==="arraybuffer" ? await response.arrayBuffer() : await response.text();
                Object.assign(data,{
                  "value":content,
                  "etag":response.headers.get('etag') || response.headers.get('last-modified') || "",//注意某些服务器不会返回etag或者last-modified
                  "version":that.requestVersion
                });
                that.db.temp[cacheKey]=data;
                _r("success");
                await that.db.setItem(data);
              }
              else{
                hasError(response.status);
              }
            }
            else{
              let xhr=new XHR();
              xhr.open("GET",url);
              xhr.responseType=responseType;
              xhr.send();
              xhr.onreadystatechange=async function(){
                if(Number(xhr.readyState)!==4) return false;
                if(that.showLog) mediaLength++;//增加一次资源加载次数
                if(Number(xhr.status)===200){
                  let content=xhr[responseType==="arraybuffer" ? "response" : "responseText"];
                  //注意某些服务器不会返回etag或者last-modified
                  Object.assign(data,{
                    "value":content,
                    "etag":xhr.getResponseHeader("etag") || xhr.getResponseHeader("last-modified") || "",
                    "version":that.requestVersion
                  });
                  that.db.temp[cacheKey]=data;
                  _r("success");
                  await that.db.setItem(data);
                }
                else{
                  hasError(xhr.status);
                  xhr.abort();
                }
              };
              xhr.onerror=_e=>{
                xhr.abort();
                _ri(_e);
              };
            }
          }
        };
        that.db.getItem(cacheKey).then((_data)=>{
          getStatus(_data,url).then(_status=>getMod(_status,_data)).catch(_err=>console.error(_err));
        });
      });
    };
    let writeJs=function(_codes){
      if(min!==""){
        Function(Object.values(_codes).join(";"))();//隐藏代码
        return true;
      }
      let thisTag=document.createElement("script");
      let thisTagName=Object.keys(_codes).length===1 ? Object.keys(_codes)[0] : "_js"+that.requestVersion;
      thisTagName=thisTagName.split("|")[0].replace(/(\.css)|(\.min)/g,"");
      //setAttribute(thisTag,thisTagName.split("|").splice(1));//用于js标签自定义属性，例如_url=?id=888|data-value=999这类的属性定义
      thisTag.setAttribute("type","text/javascript");
      thisTag.setAttribute("data-name",thisTagName);
      thisTag.innerHTML=Object.values(_codes).join(";");
      head.appendChild(thisTag);
    };//往页面写入js
    let writeCss=function(_codes){
      let thisTag,thisTagName=Object.keys(_codes).length===1 ? Object.keys(_codes)[0] : "_css"+that.requestVersion;
      thisTagName=thisTagName.split("|")[0].replace(/(\.css)|(\.min)/g,"");
      if(min!==""){
        thisTag=head.querySelector(`[data-name=${thisTagName}]`);
        if(thisTag!==null){
          thisTag.innerHTML+=Object.values(_codes).join(" ");
          return false;
        }
      }
      thisTag=document.createElement("style");
      //setAttribute(thisTag,thisTagName.split("|").splice(1));
      thisTag.setAttribute("type","text/css");
      thisTag.setAttribute("data-name",thisTagName);
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
      return new Promise((_resolve,_reject)=>{
        let cacheKey;
        let writeCode={
          "JS":writeJs,
          "CSS":writeCss,
          "FONT":writeFont
        }[_fileType.toUpperCase()];
        let codes={};
        let Promises=[];
        _modules.forEach((_k)=>{
          codes[_k]='';
          let runThis=function(_resolve,_reject){
            cacheKey=getCacheKey(_k,_fileType);//(that.dataDir+_fileType+min+'/'+_k.replace(/(\.js)|(\.css)/g,"")+min);
            let thisData=that.db.temp[cacheKey] ? that.db.temp[cacheKey] : "";
            codes[_k]=thisData.value;
            that.returnData.push({
              key:_k,
              value:thisData.value || '',
              version:thisData.version,
              etag:thisData.etag
            });
            _resolve("success");
          };
          Promises.push(new Promise(runThis));
        });
        Promise.all(Promises).then(()=>{
          if(that.preload===1){
            _resolve("success");
            return false;
          } //预加载不应用于当前页面
          if(!writeCode) return _resolve("页面写入仅支持js、css、font");
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
            await loadMod(_modules[i],_fileType);
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
          await loadMod(_modules[i],_fileType);
          _resolve("success");
        }));
        Promise.all(promises).then(async _=>{
          await writeThese(_modules,_fileType);
          _resolve("success");
        });
      };
    };
    let loadThese=function(_modules,_fileType){
      if(!_modules || _modules.length===0){
        return new Promise(_resolve=>_resolve("success"));
      }
      return new Promise(that.multiLoad ? multiLoad(_modules,_fileType) : serialLoad(_modules,_fileType));//线上并行，线下串行（可调试）
    };//加载
    //indexDB实例
    this.db=new localDB({version:this.requestVersion});
    this.db.temp={};//页内缓存数据
    this.db.getUrl=getUrl;
    this.returnData={};//用于run返回的数据
    this.run=async function(){
      if(typeof (this.lifeCycle)==="object"){
        that.lifeCycle=this.lifeCycle[0];
        that.cycleDelay=this.lifeCycle[1];
      }
      that.requestVersion=getVersion(that.lifeCycle,that.cycleDelay);
      that.db=new localDB({version:that.requestVersion});
      this.db.temp={};//页内缓存数据
      this.db.getUrl=getUrl;
      this.returnData={};//用于run返回的数据
      that.returnData=[];
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
      if(typeof (that.callback)==="function") that.callback.call(that,that.returnData);
      //await that.db.close();
      return that.returnData.length===0 ? false : (that.returnData.length===1 ? that.returnData[0] : that.returnData);
      //console.timeEnd(ct);
    };
    this.loadFile=async function(_url,_lifeCycle){
      that.dataCss=[];
      that.dataJS=[];
      that.dataFont=[];
      that.dataFile=[_url].flat();
      that.preload=1;
      return await that.run();
    };
    this.loadJs=async function(_url){
      that.dataCss=[];
      that.dataJs=[_url].flat();
      that.dataFont=[];
      that.dataFile=[];
      that.preload=1;
      return await that.run();
    };
    this.loadCss=async function(_url){
      that.dataCss=[_url].flat();
      that.dataJS=[];
      that.dataFont=[];
      that.dataFile=[];
      that.preload=1;
      return await that.run();
    };
    this.loadFont=async function(_url){//隐藏应用
      that.dataCss=[];
      that.dataJS=[];
      that.dataFont=[_url].flat();
      that.dataFile=[];
      that.preload=1;
      return await that.run();
    };
    this.nextLife=function(_hours,_delayHours){
      let hours=_hours || that.lifeCycle;
      let delayHours=_delayHours || that.cycleDelay;
      return new Date(getVersion(hours,delayHours)).toLocaleString();
    };
    let that=this;//关键字避嫌
  };
  _global.headLoader=headLoader;
  _global.hLoader=headLoader;
  //_global.headLoader=headLoader;
  //_global.headLoader=_global.headLoader ? _global.headLoader : headLoader;
  let thisScript;
  let dataJs=[],
    dataCss=[],
    dataFont=[],
    dataFile=[];
  let dataDir;
  let dataActive=false;//是否自动切换线上与线下代码路径，默认否
  let lifeCycle=24;//缓存失效时间周期
  let cycleDelay=0;//缓存失效时间延迟
  let mediaLength=1;//文件个数，用于统计页面加载多少个文件
  let startTime=new Date().getTime();//开始时间，用于统计页面加载时长
  thisScript=document.currentScript;
  let reLog=console.log && min!==".min";
  let showLog=false;
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
    lifeCycle=Number(thisScript.getAttribute("data-lifecycle"));
  }
  if(thisScript.hasAttribute("data-cycledelay")){
    cycleDelay=Number(thisScript.getAttribute("data-cycledelay"));
  }
  else{
    if(reLog) console.log(`%c友情提示:script标签未设置"data-lifeCycle"属性,默认为0(开发环境)或24小时(线上环境）.`,"color:#69F;");
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
  if(thisScript.hasAttribute("data-showlog")){
    showLog=["true",""].includes(thisScript.getAttribute("data-showlog"));
  }
  if(min!=="") thisScript.remove(); //线上环境隐藏headLoader.js
  (async _=>{
    if(document.getElementsByTagName('HEAD').length===0) return false;
    let initLoader=new headLoader();
    initLoader.lifeCycle=lifeCycle;
    initLoader.cycleDelay=cycleDelay;
    if(dataDir) initLoader.dataDir=dataDir;
    if(dataCss.length>0) initLoader.dataCss=dataCss;
    if(dataJs.length>0) initLoader.dataJs=dataJs;
    if(dataFont.length>0) initLoader.dataFont=dataFont;
    if(dataFile.length>0) initLoader.dataFile=dataFile;
    initLoader.showLog=showLog;//是否显示统计
    let srcSearch=thisScript.src.replace(/.+\.js\?v=(.*)/,"$1");
    srcSearch=new Date(srcSearch).getTime();
    if(srcSearch){
      let srcSearchBackup=await initLoader.db.getValue("srcSearch");
      if((!srcSearchBackup) || typeof (srcSearchBackup)==="string" || (srcSearchBackup && srcSearchBackup<srcSearch)){
        await initLoader.db.delete();
        await initLoader.db.setValue("srcSearch",srcSearch);
        localStorage.clear();
      }
    }
    await initLoader.run();
  })();
};
headLoaderSource();
getHeaderLoader=_=>`function _asyncToGenerator(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,n){return function a(r,o){try{var s=t[r](o),i=s.value}catch(e){return void n(e)}if(!s.done)return Promise.resolve(i).then(function(e){a("next",e)},function(e){a("throw",e)});e(i)}("next")})}} const headLoaderSource=${headLoaderSource};headLoaderSource()`;
