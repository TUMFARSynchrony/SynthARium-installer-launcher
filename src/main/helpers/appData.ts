import { app } from 'electron';
import fs from 'fs';
import runTimeMemory from './runTimeMemory';
import { ConfigKeys, IConfigs } from '../../constants/interfaces';

export const getAppPath = () => {
  // eslint-disable-next-line prefer-template
  return app.getPath('appData') + '/syntharium-installer-launcher';
};

export const createFolderIfNotExist = (folderName: string): string | null => {
  let path = `${getAppPath()}/${folderName}`;
  path = path?.replace(/\/$/, '') || '';
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    return path;
  } catch (e) {
    console.log(
      `[ERROR]: Initialize AppDataPath failed with the following error: ${e}`,
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
    const path = createFolderIfNotExist('');
    // eslint-disable-next-line prefer-template
    const filePath = path + '/config.json';
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

    console.log(
      '[INFO] App initialized with the following configs:',
      runTimeMemory,
    );
  } catch (e) {
    console.log(
      `[ERROR]: Initialize Config File failed with the following error: ${e}`,
    );
  }
};

export const upsertConfigToConfigFile = (key: string, value: string) => {
  if (!key || !value) {
    return;
  }
  try {
    const path = createFolderIfNotExist('');
    // eslint-disable-next-line prefer-template
    const filePath = path + '/config.json';
    createConfigFileIfNotExist(filePath);
    const configString = fs.readFileSync(filePath).toString();
    const configs = JSON.parse(configString);
    (configs as Record<typeof key, typeof key>)[key] = value;
    (runTimeMemory as Record<typeof key, typeof key>)[key] = value;
    fs.writeFileSync(filePath, JSON.stringify(configs));
    console.log(
      `[INFO] Config (${key}, ${value}) has been added to config file`,
    );
  } catch (e) {
    console.log(
      `[ERROR]: Upserting config to a file (${key}, ${value})failed with the following error: ${e}`,
    );
  }
};
