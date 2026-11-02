import { createApp } from './src/app.js';

const port = Number(process.env.PORT ?? 3000);
const { server, db } = createApp();

server.listen(port, () => {
  console.log('國立金門大學校務資訊系統（示範）已啟動');
  console.log(`網址：http://localhost:${port}`);
  console.log(`資料檔：${db.filePath}`);
  if (db.created) {
    console.log('已建立示範資料，預設帳號請見登入頁。');
  }
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
