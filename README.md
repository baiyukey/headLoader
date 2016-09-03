# byLoader
#byLoader用于html页面加载及管理css/js文档
#欢迎您使用byLoader

插件简介
byLoader用于加载css及js文档,他有如下优点:
1.可以实现一个script标签加载页面所需的全部css及js文档;
2.对加载文档进行缓存可控化,每两个小时更新一次,防止版本迭代时不能及时更新页面;
3.当页面刷新或者重新载入时,会从缓存中优先读取,缩短响应时间,令页面载入快如闪电;
4.减少服务器请求数量;
5.减少客户端网络流量;
6.外网自动加载文档的.min版本,内网加载正常版本,开发及上线一气呵成,减少维护成本.
使用方法:

<script type="text/javascript" data-media-dir="/media/user/" data-css="public/global,public/color,other" data-js="libs/jquery-3.1.0,libs/jquery.byAlert" src="/media/user/js/modules/byLoader.min.js"></script>
使用说明
1.在页面的合适位置插入javascript标签
2.javascript标签的属性"data-media-dir"为文件的基础路径*必需
3.javascript标签的属性"data-css"属性为css模块,多个css以逗号分割,byLoader会依次加载,css文件不需要指定文件的扩展名称*可选
4.javascript标签的属性"data-js"属性为js模块,多个js以逗号分割,byLoader会依次加载,js文件不需要指定文件的扩展名称*可选
注意事项
1.css模块的路径是与基础路径之间会自动加上一层"css/"目录,js模块的路径是与基础路径之间会自动加上一层"js/"目录;
2.页面css不用在data-css中指定,byLoader会自动指定,例如当页面为127.0.0.1/index/index.html,则对应的css为127.0.0.1/[data-media]/css/index/index.css
3.页面js不用在data-js中指定,byLoader会自动指定,例如当页面为127.0.0.1/index/index.html,则对应的js为127.0.0.1/[data-media]/js/modules/index/index.js
4.支持require.js,当data-js中包含require时,则会自动为require.js指定页面模块路径,即data-main属性自动设为[data-media]/js/modules/index/index,正因如此,data-main模块将脱离byLoader缓存机制
5.byLoader会自动将文件缓存到localStorage中,页面下次加载会自动从localStorage中读取,从而使页面加载快如闪电.
6.如果是公有IP或者非localhost,所加载的文档会直接从localStorage中读取,并且每两个小时更新一次.
7.如果是私有IP或者localhost,为了开发调试方便每刷新一次更新一次,由此加载速度较慢,请知晓.
项目路径
https://github.com/baiyukey/byLoader
作者:龙马印
联系方式:baiyukey@hotmail.com
