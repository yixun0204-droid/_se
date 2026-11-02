import { createApp } from './src/app.js';

const port = Number(process.env.PORT ?? 3000);
const { server, index } = createApp();

server.listen(port, () => {
  console.log('安心搜尋（SafeSearch）已啟動');
  console.log(`網址：http://localhost:${port}`);
  console.log(`索引文件數：${index.size}`);
  console.log('排序演算法：TF-IDF 餘弦相似度（不使用任何個人偏好）');
  console.log('敏感關鍵字：偵測到自我傷害或嚴重情緒困擾時，優先顯示求助資源');
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
