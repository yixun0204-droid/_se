import fs from 'node:fs';
import path from 'node:path';

function writeAtomic(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, filePath);
}

export function openDb(filePath, createInitialData) {
  let data;
  let created = false;

  if (!fs.existsSync(filePath)) {
    data = createInitialData();
    writeAtomic(filePath, data);
    created = true;
  } else {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  return {
    filePath,
    created,
    get data() {
      return data;
    },
    save() {
      writeAtomic(filePath, data);
    },
    reload() {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data;
    },
  };
}
