import { IConfigs } from '../../constants/interfaces';

const runTimeMemory: IConfigs = {
  hubProcessId: 0,
  pythonVersion: null,
  ngrokAuthToken: null,
  openAiToken: null,
  hostUrl: null,
  isProjectInstalled: null,
};

export const DOCKER_IMAGE = 'hhuseyinkacmaz/test2';
export const GITHUB_URL = 'https://github.com/TUMFARSynchrony/SynthARium.git';
export const GITHUB_BRANCH = 'development-without-dlib';

export default runTimeMemory;
