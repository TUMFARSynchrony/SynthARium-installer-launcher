import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import runTimeMemory from './runTimeMemory';
import { ConfigKeys, IConfigs } from '../../constants/interfaces';

export const getAppPath = () => {
  // eslint-disable-next-line prefer-template
  return app.getPath('appData') + '/syntharium-installer-launcher';
};

export const createFolderIfNotExist = (folderName: string): string | null => {
  let folderPath = path.join(getAppPath(), folderName);
  folderPath = folderPath?.replace(/\/$/, '') || '';
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    return folderPath;
  } catch (e) {
    console.error(
      `Initialize AppDataPath failed with the following error: ${e}`,
    );
    return null;
  }
};

export const initializeAppDataPath = () => {
  createFolderIfNotExist('');
};

const createConfigFileIfNotExist = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    const data = {
      ngrokAuthToken: '',
      openAiToken: '',
      isProjectInstalled: false,
    };
    fs.writeFileSync(filePath, JSON.stringify(data));
  }
};

export const initializeAndReadConfigFile = () => {
  try {
    const configPath = createFolderIfNotExist('');
    const filePath = path.join(configPath || '', 'config.json');
    createConfigFileIfNotExist(filePath);
    const configString = fs.readFileSync(filePath).toString();
    const configs = JSON.parse(configString) as IConfigs;
    runTimeMemory[ConfigKeys.ngrokAuthToken] =
      configs[ConfigKeys.ngrokAuthToken];
    runTimeMemory[ConfigKeys.openAiToken] = configs[ConfigKeys.openAiToken];
    runTimeMemory[ConfigKeys.isProjectInstalled] =
      configs[ConfigKeys.isProjectInstalled];
    runTimeMemory[ConfigKeys.experimenterPassword] =
      configs[ConfigKeys.experimenterPassword];

    console.log(`App initialized with the following configs: ${runTimeMemory}`);
  } catch (e) {
    console.error(
      `Initialize Config File failed with the following error: ${e}`,
    );
  }
};

export const upsertConfigToConfigFile = (key: string, value: string) => {
  if (!key) {
    return;
  }
  try {
    const configPath = createFolderIfNotExist('');
    const filePath = path.join(configPath || '', 'config.json');
    createConfigFileIfNotExist(filePath);
    const configString = fs.readFileSync(filePath).toString();
    const configs = JSON.parse(configString);
    (configs as Record<typeof key, typeof key>)[key] = value;
    (runTimeMemory as Record<typeof key, typeof key>)[key] = value;
    fs.writeFileSync(filePath, JSON.stringify(configs));
    console.log(
      `Config (${key}, ${(value || '').replace(/./g, '*') || '<empty>'}) has been added to config file`,
    );
  } catch (e) {
    console.error(
      `Upserting config to a file (${key}, ${value})failed with the following error: ${e}`,
    );
  }
};
