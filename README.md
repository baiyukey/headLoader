欢迎您使用headLoader
==
插件简介
--
### headLoader的主要功能有：`资源加载`、`预加载`、`热加载`、`多页面缓存共享`、`代码隐藏`等。
### 主要作用是使网站快速响应及反编译。
### 由于使用纯前端技术，基本上用"0成本"就能使普通的网站得到明显的加速及优化。
### 当前版本为v2.4.8,他有如下特点：
    1.可实现一个script标签加载页面所需的全部css及js文档；
    2.支持"js","css","svg","text","xml","json","html","htm"等文本文件的读取；
    3.支持图片、视频、字体、图标库等二进制文件类型的读取；
    4.当页面刷新或者重新载入时，会从缓存中优先读取，缩短响应时间，减少页面载入时的闪烁；
    5.可实现资源预加载功能，即加载完成后存入缓存，当其它页面需要时从缓存快速读取；
    6.资源热加载，即加载完成后自动应用，而不需要刷新页面；
    7.缓存生命周期可自定义，默认每24个小时更新一次，即能复用本地缓存又能保证代码的时效性；
    8.缓存生命周期结束后，如果服务器文件未修改，继续使用本地缓存，进一步减少网络流量提高效率；
    9.生产环境自动加载(js、css)文档的.min版本，开发环境加载正常版本，开发及上线一气呵成，减少维护成本；
    10.生产环境并行加载文档加快速度，开发环境串行加载利于观察程序运行；
    11.生产环境程序在内存中运行便于保护及隐藏代码，开发环境正常在页面中运行方便调试与定位；
    12.从v2.0.0版本后使用`indexedDB`数据库，容量不再受限制，尽可用它构建更大规模的项目。
快速上手
--
### 普通页面加载资源方法
```html
<script type="text/javascript" src="/a.js"></script>
<script type="text/javascript" src="/b.js"></script>
<script type="text/javascript" src="/c.js"></script>
<script type="text/javascript" src="/d.js"></script>
<link rel="stylesheet" href="/a.css" type="text/css">
<link rel="stylesheet" href="/b.css" type="text/css">
<link rel="stylesheet" href="/c.css" type="text/css">
```
### 现在，可以使用headLoader实现上述功能  *注意！headerLoader.js不仅能实现上述功能，还会自动将资源缓存到indexedDB，当刷新页面或者其它页面再次请求相同资源时，直接从缓存读取，不会重复请求服务器，另外还支持html、svg等文件类型的读取
```html
<script type="text/javascript" data-dir="/" data-js="a,b,c,d" data-css="a,b,c" src="/headLoader.min.js"></script>
```
使用方法(任选其一)
--
### 1.标签属性定义法(推荐)
```html
<script type="text/javascript" data-dir="/media/user/" data-css="public/global,public/color,other,_css" data-js="libs/jquery-3.1.0,libs/jquery.elfAlert,_js" src="/media/user/js.min/libs/headLoader.min.js"></script>
```
### 2.命令行语句法
```html
<script type="text/javascript" src="/media/user/js/libs/headLoader.js"></script>
```
```javascript
   let loader=new hLoader();
   // String | js、css资源路径，默认"./" | 可选项
   loader.dataDir="/media/";
   // Array | CSS资源，默认为空数组"[]" | 可选项
   loader.dataCss=['public/css1','public/css2','_css'];
   // Array | JS资源，默认为空数组"[]" | 可选项
   loader.dataJs=['libs/jquery-3.1.0','libs/jquery.elfAlert','_js'];
   // Array | 字体资源，默认为空数组"[]" | 可选项
   loader.dataFont=['fonts/a.woff','fonts/b.woff'];
   // Array | 支持更多类型的资源，例如html、svg等，默认为空数组"[]" | 可选项
   loader.dataFile=['html/a.html','svg/a.svg'];
   // Number | 缓存生命周期，单位小时，默认24 | 可选项
   loader.lifeCycle=24;
   // Number | 每次缓存延迟时间，单位小时，默认0 | 可选项
   loader.cycleDelay=24;
   // Boolean | 线下与线上路径是否自动切换，例如"/js/"转为"/js.min/"，"/a.js"转为"a.min.js"，默认False | 可选项
   loader.dataActive=false;
   // Boolean | 是否显示加载统计，默认false | 可选项
   loader.showLog=false;
   // Number, 0或1 | 预加载开关 1:预加载打开(不应用于当前页面)，0:预加载关闭（加载后立即应用于当前页面）。 默认0 | 可选项
   loader.preload=0;
   // Function | 外部命令法可以定义回调函数，参数为请求的数据结果 | 仅用于命令行模式 | 可选项
   loader.callback=function(_data){console.log(_data)}
   await loader.run()
   // run()结果只有一个值时返回：{"/media/css/public/css.css":value, ...}
   // run()结果有多个值时返回：[{"/media/css/public/css.css":value, ...},...]
   // run()结果没有值时返回：false
```
#### 当然,您也可以写成这样
```javascript
   let loader=new hLoader({
      dataDir:"/media/",
      dataCss:['public/css1','public/css2','_css'],
      dataJs:['libs/jquery-3.1.0','libs/jquery.elfAlert','_js'],
      dataFont:['fonts/a.woff','fonts/b.woff'],
      dataFile:['html/a.html','svg/a.svg'],
      lifeCycle:2,
      dataActive:false
      showLog:false,
      preload:0,
      callback:function(_data){console.log(_data)}
   });
   await loader.run()
```
#### 更多类型加载
```javascript
   //支持的文本文件类型有："js","css","svg","text","xml","json","html","htm"等
   //支持二进制文件类型但不限于这些类型："jpg","png","woff"等
   let thisLoader=new hLoader();
   let files;
   //读取一个文件，第一次从网络地址读取，第二次从indexedDB中读取，如果数据过期，会自动更新。
   files=await thisLoader.loadFile("/button.svg");
   console.log(files.value);
   //同理缓存JS并返回所有文件代码
   files=await thisLoader.loadJs(["/index.js","/button.js"]);
   //同理缓存CSS并返回所有文件代码
   files=await thisLoader.loadCss(["/index.css","/button.css"]);
   //缓存并读取其它类型文件
   files=await thisLoader.loadFile(["/index.html","/button.svg","/a.jpg"]);
   //从files结果中检索文件代码
   console.log(files.find(_v=>_v.key==="/index.html").value);
   //或者thisLoader.db.getValue(_src)方法可返回文件代码
   console.log(thisLoader.db.getValue("/button.svg"));
   //thisLoader.db.getBase64(_src)方法可返回图片的base64编码
   console.log(thisLoader.db.getBase64("/a.jpg"));
```
#### 一个加载图片实例
```html
 <img data-file="/images/1.png">
 <img data-file="/images/2.png">
```
```javascript
let loadImg=async function(_e){
 let imgLoader=new headLoader();
 imgLoader.lifeCycle=7*24;
 await imgLoader.loadFile(_e.getAttribute("data-file"));
 _e.src= await imgLoader.db.getBase64(thisSrc);
};
document.querySelectorAll("img[data-file]").forEach(_=>loadImg(_));
```
#### 如何实现跨页缓存管理
```javascript
   //a.html和b.html的JS程序需要先各自实例化一个headLoader
   let loader=new hLoader();
   //仅在报错信息为数据库未打开时使用，整个网站只调用一次即可
   await loader.db.open();
   //在任意一个页面缓存写入使用命令：loader.db.setValue(key,value)
   await loader.db.setValue("names",["张三","李四","王五"]);
   //在任意任一个页面缓存读取：loader.db.getValue(key)
   let names=await loader.db.getValue("names");
   console.log(names);//["张三","李四","王五"] 或 false
```
使用说明
--
    1.在页面的合适位置插入javascript标签
    2.javascript标签的"data-dir"属性定义模块的基础路径(*可选)[默认值:'./'];
    3.javascript标签的"data-css"属性定义css模块,多个css以逗号分割,headLoader会依次加载,不需要指定文件的扩展名称(*可选)[默认值:'']
    4.javascript标签的"data-js"属性定义js模块,多个js以逗号分割,headLoader会依次加载,不需要指定文件的扩展名称(*可选)[默认值:''];
    5.data-lifecycle为Number类型，代表缓存生成周期，单位小时，默认24 | 可选项
    6.data-active为Boolean类型，代表是否自动切换线上线下路径，默认flase | 可选项 [*请参考具体说明13]
    5.标签属性定义法与命令行语句法中的属性名称分别如下一一对应:
        data-dir  相当于 dataDir
        data-css 相当于 dataCss
        data-js    相当于 dataJs
        data-font    相当于 dataFont
        data-file    相当于 dataFile
        data-src    相当于 dataSrc
        data-lifecycle    相当于 lifeCycle
        data-cycledelay    相当于 cycleDelay
        data-active    相当于 dataActive
    6.如果想预加载资源以备后面的页面使用时，可以设置preload参数为1，1为预加载功能开启，0为加载后立即应用于当前页面，默认为0
    8.命令行语句法可以定义回调函数callback,标签属性定义法不支持定义回调函数
具体说明
--
   欢迎访问我的个人网站解锁更多玩法 [UI精灵 uiElf.com](http://www.uielf.com/headLoader/) 
   作者:宇哥
   联系方式:baiyukey@qq.com
