import { existsSync, promises as fs, mkdirSync } from 'fs';
import path from 'path';

export const getFileDir = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  return filePath;
};

export const writeContentFile = async (
  existedFilePath: string,
  data: string,
  options: Partial<{ replace: boolean }> = {}
) => {
  const { replace = false } = options;
  try {
    await fs.writeFile(existedFilePath, data, {
      encoding: 'utf8',
      flag: replace ? 'w' : 'a',
    });
    return true;
  } catch {
    return false;
  }
};

export const readContentFile = async (filePath: string): Promise<string> => {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
};
