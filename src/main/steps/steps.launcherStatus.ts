import { ConfigKeys } from '../../constants/interfaces';
import runTimeMemory from '../helpers/runTimeMemory';

// eslint-disable-next-line import/prefer-default-export
export const stepsLauncherStatus = () => {
  const chatGptStatus = !!runTimeMemory[ConfigKeys.openAiToken];
  const openFaceStatus = false;
  const ngrokStatus = !!runTimeMemory[ConfigKeys.ngrokAuthToken];
  const isProjectLive = !!runTimeMemory[ConfigKeys.hubProcessId];
  const hostUrl = runTimeMemory[ConfigKeys.hostUrl];

  const data = {
    chatgpt: chatGptStatus,
    openface: openFaceStatus,
    ngrok: ngrokStatus,
    isProjectLive,
    hostUrl,
  };
  return data;
};
