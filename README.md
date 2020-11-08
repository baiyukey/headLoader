欢迎您使用headLoader
===
##插件简介<br>
    headLoader用于加载、预加载及缓存网站资源，实现网站快速响应，优化服务器请求的目的。使用纯前端技术，基本上用"0成本"就能使普通的网站得到明显的加速效果。当前版本为1.0.2,他有如下特点:<br>
    1.可以实现一个script标签加载页面所需的全部css及js文档;<br>
    2.对加载文档进行缓存可控化,每两个小时更新一次(需要设置参数),防止版本迭代时不能及时更新页面;<br>
    3.当页面刷新或者重新载入时,会从缓存中优先读取,缩短响应时间,减少页面载入时的闪烁;<br>
    4.减少服务器请求数量;<br>
    5.减少客户端网络流量;<br>
    6.外网自动加载文档的.min版本,内网加载正常版本,开发及上线一气呵成,减少维护成本.<br>
    7.外网并行加载文档加快速度,内网串行加载利于观察程序运行.<br>
    8.外网程序在内存中运行便于保护代码,内网正常在页面中运行方便调试与定位.<br>
    9.可用于页面资源预加载.<br>
##快速上手<br>
    普通页面加载资源方法:<br>
    <script type="text/javascript" src="/a.js"></script>
    <script type="text/javascript" src="/b.js"></script>
    <script type="text/javascript" src="/c.js"></script>
    <script type="text/javascript" src="/d.js"></script>
    <link rel="stylesheet" href="/a.css" type="text/css">
    <link rel="stylesheet" href="/b.css" type="text/css">
    <link rel="stylesheet" href="/c.css" type="text/css">
    
    现在，可以使用headLoader实现上述功能  *注意！headerLoader.js不仅能实现上述功能，还会自动缓存，再次请求时不会重复请求服务器
    <script type="text/javascript" data-dir="/" data-js="a,b,c,d" data-css="a,b,c" src="/headLoader.min.js"></script>
##使用方法(任选其一)<br>
    1.标签属性定义法(推荐):<br>
      <script type="text/javascript" data-dir="/media/user/" data-css="public/global,public/color,other,_css" data-js="libs/jquery-3.1.0,libs/jquery.elfAlert,_js" src="/media/user/js.min/libs/headLoader.min.js"></script>
        
    2.命令行语句法:
      <script type="text/javascript" src="/media/user/js/libs/headLoader.js"></script>
      <script type="text/javascript">
          var loader=new headLoader();
          loader.dataDir="/media/user/";
          loader.dataCss=['public/global','public/color','other','_css'];
          loader.dataJs=['libs/jquery-1.8.0','libs/jquery.elfAlert','_js'];
          loader.writeDocument=1;
          loader.callBack=function(){console.log("headLoader is done!")};   //外部命令法可以定义回调函数
          loader.run();
      </script>
    当然,您也可以写成这样:
      <script type="text/javascript">
          var loader=new headLoader({
            dataDir:"/media/users/",
            dataCss:['public/global','public/color','other','_css'],
            dataJs:['libs/jquery-1.8.0','libs/jquery.elfAlert','_js'],
            writeDocument:1,
            callBack:function(){console.log("headLoader is done!")}   //外部命令法可以定义回调函数
          });
          loader.run();
      </script>
##使用说明<br>
    1.在页面的合适位置插入javascript标签<br>
    2.javascript标签的"data-dir"属性定义模块的基础路径(*可选)[默认值:'./'];<br>
    3.javascript标签的"data-css"属性定义css模块,多个css以逗号分割,headLoader会依次加载,不需要指定文件的扩展名称(*可选)[默认值:'']<br>
    4.javascript标签的"data-js"属性定义js模块,多个js以逗号分割,headLoader会依次加载,不需要指定文件的扩展名称(*可选)[默认值:''];<br>
    5.标签属性定义法与命令行语句法中的属性名称分别如下一一对应:<br>
        data-dir  相当于 dataDir<br>
        data-css 相当于 dataCss<br>
        data-js    相当于 dataJs<br>
    6.如果想预加载资源以备后面的页面使用时，可以设置writeDocument参数为0，0为只做缓存，1为缓存并写入HTML，默认为1<br>
    7.命令行语句法可以定义回调函数,标签属性定义法不支持定义回调函数<br>
##注意事项<br>
    1.由于本插件需要使用localStorage功能,所以必须使用现代浏览器,例如:Chrome、Firefox等;
    2.javascript标签的"data-css"属性定义css模块,多个css以逗号分割,headLoader会依次加载,不需要指定文件的扩展名称，"data-js"同理
    3.标签属性定义法与命令行语句法中的属性名称分别如下一一对应: data-dir 相当于 dataDir data-css 相当于 dataCss data-js 相当于 dataJs;
    4.css模块在"dataDir"路径下的"css"目录中,js模块在"dataDir"路径下的"js"目录中;
    5.命令行语句法可以定义回调函数,标签属性定义法不支持定义回调函数.
    6.当data-css包含"_css"模块时,代表headLoader自动加载页面css,例如当页面为127.0.0.1/index/index.html,则对应的css为127.0.0.1/[data-dir]/css/index/index.css;
    7.当data-js包含"_js"模块时,代表headLoader自动加载页面js,例如当页面为127.0.0.1/index/index.html,则对应的js为127.0.0.1/[data-dir]/js/index/index.js;
    8.当需要给加载的css或js标签添加属性时,直接在模块地址后追加"_js|属性名=属性值|属性名=属性值|...",例如loader.dataJs=['_js|id=abc'];
    9.如果是公有IP或者非localhost,所加载的文档会直接从localStorage中读取,版本每两个小时更新一次;
    10.如果是私有IP或者localhost开发环境,每次刷新页面都会重新加载资源,这样做是为了方便开发调试,由此加载速度较慢,请知晓;
    11.当使用headLoader.js时,在本地开发环境下会以console.log()命令友情提示,如果不希望出现提示请使用压缩文件headLoader.min.js.
    12.当模块为完整的http地址时,例如loader.dataJs=['http://dwz.cn/headLoader'],将直接创建标签并加载,不进行任何处理.
    13.如果您使用了elfFrame框架，需要为headLoader添加“dataElfFrame”属性并置为true,此时开发环境正常加载,但是线上环境会将“/js/”目录切换为"/js.min/"目录，并将文件扩展名".js"改为".min.js"（CSS同理）。例如“/media/js/a.js”在线上环境会自动切换为“/media/js.min/a.min.js”
##更多...<br>
      http://www.uielf.com/headLoader/<br>
      作者:宇哥<br>
      联系方式:baiyukey@qq.com<br>
