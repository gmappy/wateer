const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
const server = http.createServer((req,res)=>{
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400); return res.end('Bad request'); }
  if (pathname === '/') pathname = '/index.html';
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(file,(err,stat)=>{
    if (err || !stat.isFile()) { res.writeHead(404,{'Content-Type':'text/plain'}); return res.end('Not found'); }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':ext==='.glb'?'public, max-age=604800':'public, max-age=300','X-Content-Type-Options':'nosniff'});
    fs.createReadStream(file).pipe(res);
  });
});
const port = Number(process.env.PORT)||10000;
server.listen(port,'0.0.0.0',()=>console.log('Aetheria listening on '+port));
