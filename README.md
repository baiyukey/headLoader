欢迎您使用headLoader
==
插件简介
--
### headLoader的主要功能有：`资源加载`、`预加载`、`热加载`、`多页面缓存共享`、`代码隐藏`等。
### 主要作用是使网站快速响应及反编译。
### 由于使用纯前端技术，基本上用"0成本"就能使普通的网站得到明显的加速及优化。
### 当前版本为v2.0.2,他有如下特点：
    1.可实现一个script标签加载页面所需的全部css及js文档;
    2.可实现资源预加载功能;
    3.资源热加载，即随需随加载，而不需要刷新页面;
    4.对加载文档进行缓存可控化,每两个小时更新一次(需要设置缓存生命周期参数),即能重用本地缓存又能保证代码的时效性;
    5.当页面刷新或者重新载入时,会从缓存中优先读取,缩短响应时间,减少页面载入时的闪烁;
    6.减少服务器请求次数同时减少客户端网络流量;
    7.外网自动加载文档的.min版本,内网加载正常版本,开发及上线一气呵成,减少维护成本;
    8.外网并行加载文档加快速度,内网串行加载利于观察程序运行;
    9.外网程序在内存中运行便于保护代码,内网正常在页面中运行方便调试与定位。
    10.从v2.0.0版本后使用`indexedDB`数据库，容量不再受限制，尽可用它构建更大规模的项目。
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
### 现在，可以使用headLoader实现上述功能  *注意！headerLoader.js不仅能实现上述功能，还会自动将资源缓存到indexedDB，当刷新页面或者其它页面再次请求相同资源时，直接从缓存读取，不会重复请求服务器
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
    loader.dataDir="/media/user/";
    loader.dataCss=['public/global','public/color','other','_css'];
    loader.dataJs=['libs/jquery-1.8.0','libs/jquery.elfAlert','_js'];
    loader.dataLifeCycle=2;
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
    dataDir:"/media/users/",
    dataCss:['public/global','public/color','other','_css'],
    dataJs:['libs/jquery-1.8.0','libs/jquery.elfAlert','_js'],
    dataLifeCycle:2,
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
    5.data-lifecycle为Number类型，代表缓存生成周期，单位小时，默认2 | 可选项
    6.data-active为Boolean类型，代表是否自动切换线上线下路径，默认flase | 可选项 [*请参考具体说明13]
    5.标签属性定义法与命令行语句法中的属性名称分别如下一一对应:
        data-dir  相当于 dataDir
        data-css 相当于 dataCss
        data-js    相当于 dataJs
        data-lifecycle    相当于 dataLifecycle
        data-active    相当于 dataActive
    6.如果想预加载资源以备后面的页面使用时，可以设置preload参数为1，1为预加载功能开启，0为加载后立即应用于当前页面，默认为0
    8.命令行语句法可以定义回调函数callback,标签属性定义法不支持定义回调函数
具体说明
--
    1.由于本插件需要使用indexedDB功能,所以必须使用现代浏览器,例如:Chrome、Firefox等;
    2.javascript标签的"data-css"属性定义css模块,多个css以逗号分割,headLoader会依次加载,不需要指定文件的扩展名称，"data-js"同理
    3.标签属性定义法与命令行语句法中的属性名称分别如下一一对应: data-dir 相当于 dataDir data-css 相当于 dataCss data-js 相当于 dataJs;
    4.css模块在"dataDir"路径下的"css"目录中,js模块在"dataDir"路径下的"js"目录中;
    5.命令行语句法可以定义回调函数,标签属性定义法不支持定义回调函数.
    6.当data-css包含"_css"模块时,代表headLoader自动加载页面css,例如当页面为127.0.0.1/index/index.html,则对应的css为127.0.0.1/css/index/index.css;
    7.当data-js包含"_js"模块时,代表headLoader自动加载页面js,例如当页面为127.0.0.1/index/index.html,则对应的js为127.0.0.1/js/index/index.js;
    8.当需要给加载的css或js标签添加属性时,直接在模块地址后追加"_js|属性名=属性值|属性名=属性值|...",例如loader.dataJs=['_js|id=abc'];
    9.如果是公有IP或者非localhost,所加载的文档会直接从localStorage中读取,版本每两个小时更新一次;
    10.如果是私有IP或者localhost开发环境,每次刷新页面都会重新加载资源,这样做是为了方便开发调试,由此加载速度较慢,请知晓;
    11.当使用headLoader.js时,在本地开发环境下会以console.log()命令友情提示,如果不希望出现提示请使用压缩文件headLoader.min.js.
    12.当模块为完整的http地址时,例如loader.dataJs=['http://dwz.cn/headLoader'],将直接创建标签并加载,不进行任何处理.
    13.在引入headLoader.js时如果添加“data-active=true”属性参数时，或者命令行语法在给实例添加dataActive并置为true，此时开发环境正常加载,但是线上环境会将“/js/”目录切换为"/js.min/"目录，并将文件扩展名".js"改为".min.js"（CSS同理）。例如“/media/js/a.js”在线上环境会自动切换为“/media/js.min/a.min.js”
更多...
--
    欢迎访问我的个人网站查看更多 (http://www.uielf.com/headLoader/)
    作者:宇哥
    联系方式:baiyukey@qq.com
