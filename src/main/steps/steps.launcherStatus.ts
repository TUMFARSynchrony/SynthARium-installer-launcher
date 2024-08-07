import { ConfigKeys } from '../../constants/interfaces';
import { stepNames } from '../../constants/stepNames';
import runTimeMemory from '../helpers/runTimeMemory';
import { stepsValidator } from './steps.validator';

// eslint-disable-next-line import/prefer-default-export
export const stepsLauncherStatus = async () => {
  const chatGptStatus = !!runTimeMemory[ConfigKeys.openAiToken];
  const openFaceStatus = await stepsValidator(stepNames.openFace);
  const ngrokStatus = !!runTimeMemory[ConfigKeys.ngrokAuthToken];
  const isProjectLive = !!runTimeMemory[ConfigKeys.hubProcessId];
  const hostUrl = runTimeMemory[ConfigKeys.hostUrl];
  const experimenterPassword = runTimeMemory[ConfigKeys.experimenterPassword];

  const data = {
    chatgpt: chatGptStatus,
    openface: !openFaceStatus.err,
    ngrok: ngrokStatus,
    experimenterPassword,
    isProjectLive,
    hostUrl,
  };
  return data;
};
