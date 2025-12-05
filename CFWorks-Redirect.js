export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      // 1️⃣ 获取访问域名头部，例如 tls.aa.aa.com → tls
      const hostnameParts = url.hostname.split(".");
      const subdomainHead = hostnameParts[0];

      // 2️⃣ 获取完整路径
      const fullPath = url.pathname.replace(/^\/+/, ""); // 去掉前导 /
      if (!fullPath) return new Response("请添加后缀后再访问", { status: 400 });

      // 3️⃣ 分割路径，取第一个 path 和后续路径
      const pathParts = fullPath.split("/");
      const firstPath = pathParts.shift();      // 第一个 path
      const remainingPath = pathParts.join("/"); // 后续路径

      // 4️⃣ 从环境变量读取配置
      const domainc = env.DOMAIN_TO;       // 重定向目标域名
      const headTLS = env.HEAD_TLS || "tls";
      const headNO = env.HEAD_NO || "no";
      const txtTLS = env.DOMAIN_TXT_TLS;   // TLS IP:PORT 或 TXT 域名
      const txtNO = env.DOMAIN_TXT_NO;     // NO IP:PORT 或 TXT 域名
      const errMsg = env.ERR_MSG || "404 Not Found";

      let txtValue;
      let protocol;

      // 5️⃣ 根据域名前缀选择 TXT 和协议
      if (subdomainHead === headTLS) {
        txtValue = txtTLS;
        protocol = "https";
      } else if (subdomainHead === headNO) {
        txtValue = txtNO;
        protocol = "http";
      } else {
        return new Response("未识别的域名头部", { status: 400 });
      }

      // 6️⃣ 如果 txtValue 不是 IP:PORT，假设是域名，查询 TXT
      if (!/^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/.test(txtValue)) {
        const dnsResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=${txtValue}&type=TXT`, {
          headers: { "Accept": "application/dns-json" }
        });
        const dnsData = await dnsResponse.json();
        if (!dnsData.Answer || dnsData.Answer.length === 0) {
          return new Response("TXT not found", { status: 404 });
        }
        txtValue = dnsData.Answer[0].data.replace(/"/g, "").trim();
      }

      // 7️⃣ 验证 TXT 格式
      const regex = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
      if (!regex.test(txtValue)) return new Response("TXT Format Error", { status: 404 });

      const [targetIP, port] = txtValue.split(":");

      // 8️⃣ 构造重定向 URL
      // 注意：如果 remainingPath 不为空，加上前导 "/"
      const redirectURL = `${protocol}://${firstPath}.${domainc}:${port}${remainingPath ? "/" + remainingPath : ""}`;

      return Response.redirect(redirectURL, 302);

    } catch (err) {
      return new Response("Server Error: " + err.message, { status: 500 });
    }
  }
};
