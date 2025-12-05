# CFWorks-Redirect

# 通过CFWorks用固定域名加path的形式，访问内网stun直连。

### 效果：浏览器固定域名来访问直连。

https:/tls.aaa.com/openwrt=======>访问路由器

https:/tls.aaa.com/nas=======>访问群晖

https:/tls.aaa.com/lucky=======>访问lucky

https:/tls.aaa.com/openwrt=======>访问路由器

对于不支持重定向的软件，无法使用，前置的固定域名，ip是指向CFWorks。建议frp。

---

### 前置条件

1.CF账号及托管在CF域名，B域名（以下用bbb.com）用**泛域名**方式解析到内网的公网ip，A域名用来访问CFWorks（以下用aaa.com），C域名和D域名（以下用ccc.com）用来更新stun端口TXT解析，一个tls一个非tls。

2.内网安装lucky插件或者能打洞的任何工具都行，支持域名更新，支持打洞状态更新CF的TXT解析即可。

3.内网安装反向（前置）代理（本人用的NPM），配置好需要暴露的网页服务即可。

---

### 原理

访问aaa.com/openwrt（转换的path）/abc（第二个及以后的path不会转换，跟在后面）时,查询C域名（更新stun，ip+端口的域名）的txt解析，提取端口号。

组合重定向域名返回=====>openwrt（转换的path）.bbb.com:stun端口/abc（不转换的path）

举例：如stun端口为1234

 tls.aaa.com/**akk**=====>https//:**ak**k.bbb.com:1234

no.aaa.com/**openwrt**/abc=====>http//:**openwrt**.bbb.com:1234/abc

tls.aaa.com/**nas**/stage/build/desk=====>https//:**nas**.bbb.com:1234/stage/build/desk

---

### 方法

1.NPM做好前置代理，配置好访问域名，强烈建议申请泛域名的证书，解决tls访问。

2.lucky插件做好**域名B**的ipv4，stun用webhook做好（ip+端口，**必须是ip+端口**）的txt解析，

（PS：以前的一直用ip+端口，不愿意改了）

3.CF新建works==>从hello开始==>拷贝项目CFWorks-Redirect.js（复制全部代码粘贴），部署。

4works设置如下

|变量|说明|举例|
| ------| ----------------------------------| -------------------------|
|​`DOMAIN_TO`​|转向的域名，内网的域名|bbb.com|
|​`DOMAIN_TXT_NO`​|http端口的解析域名|notlstxt.aaa.com|
|​`DOMAIN_TXT_TLS`​|https端口的解析域名|tlstxt.aaa.com|
|​`HEAD_NO`​|http访问头，明确是访问http端口|no|
|​`HEAD_TLS`​|https访问头，明确是访问https端口|tls|
|​`ERR_MSG`​|错误返回的信息|404，您访问的地址不存在|
||||

把带头部的域名绑定到这个works上。如no.aaa.com和tls.aaa.com

‍

### 以后访问的固定域名为（域名必须带头部和path）：

tls访问：**tls头域名+path地址。=====&gt;** https//:**path地址**.bbb.com:tls端口

notls访问：no**头域名+path地址。=====&gt;** http//:**path地址**.bbb.com:notls端口

‍
