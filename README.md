欢迎您使用headLoader
==
插件简介
--
### headLoader的主要功能有：`资源加载`、`预加载`、`热加载`、`多页面缓存共享`、`代码隐藏`等。
### 主要作用是使网站快速响应及反编译。
### 由于使用纯前端技术，基本上用"0成本"就能使普通的网站得到明显的加速及优化。
### 当前版本为v2.1.0,他有如下特点：
    1.可实现一个script标签加载页面所需的全部css及js文档；
    2.支持html、svg等文件类型的读取;
    3.当页面刷新或者重新载入时，会从缓存中优先读取，缩短响应时间，减少页面载入时的闪烁；
    4.可实现资源预加载功能；
    5.资源热加载，即随需随加载，而不需要刷新页面；
    6.缓存生命周期可自定义，默认每24个小时更新一次，即能复用本地缓存又能保证代码的时效性；
    7.缓存生命周期结束后，如果服务器文件未修改，继续使用本地缓存，进一步减少网络流量提高效率；
    8.生产环境自动加载(js、css)文档的.min版本，开发环境加载正常版本，开发及上线一气呵成，减少维护成本；
    9.生产环境并行加载文档加快速度，开发环境串行加载利于观察程序运行；
    10.生产环境程序在内存中运行便于保护及隐藏代码，开发环境正常在页面中运行方便调试与定位；
    11.从v2.0.0版本后使用`indexedDB`数据库，容量不再受限制，尽可用它构建更大规模的项目。
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
<script type="text/javascript">
    let loader=new headLoader();
    loader.dataDir="/media/user/"; //仅对js、css文件
    loader.dataCss=['public/global','public/color','other','_css'];
    loader.dataJs=['libs/jquery-1.8.0','libs/jquery.elfAlert','_js'];
    loader.dataSrc=['/a.html','/b.svg'];
    loader.dataLifeCycle=12;
    loader.dataActive=false;
    loader.preload=0;
    loader.callback=function(){console.log("headLoader is done!")};   //外部命令法可以定义回调函数
    loader.run();
</script>
```
#### 当然,您也可以写成这样
```html
<script type="text/javascript">
  let loader=new headLoader({
    dataDir:"/media/users/",  //仅对js、css文件
    dataCss:['public/global','public/color','other','_css'],
    dataJs:['libs/jquery-1.8.0','libs/jquery.elfAlert','_js'],
    dataSrc:['/a.html','/b.svg'],
    dataLifeCycle:24,
    dataActive:false,
    preload:0,
    callback:function(){console.log("headLoader is done!")}   //外部命令法可以定义回调函数
  });
  loader.run();
</script>
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
        data-src    相当于 dataSrc
        data-lifecycle    相当于 dataLifecycle
        data-active    相当于 dataActive
    6.如果想预加载资源以备后面的页面使用时，可以设置preload参数为1，1为预加载功能开启，0为加载后立即应用于当前页面，默认为0
    8.命令行语句法可以定义回调函数callback,标签属性定义法不支持定义回调函数
具体说明
--
   欢迎访问我的个人网站查看更多 [UI精灵](http://www.uielf.com/headLoader/) 
   作者:宇哥
   联系方式:baiyukey@qq.com
