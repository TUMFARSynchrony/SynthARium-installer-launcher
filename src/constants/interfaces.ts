import topics from './topics';

export interface IGenericMessage {
  err?: any;
  message?: string;
}

export enum ConfigKeys {
  hubProcessId = 'hubProcessId',
  pythonVersion = 'pythonVersion',
  ngrokAuthToken = 'ngrokAuthToken',
  openAiToken = 'openAiToken',
  experimenterPassword = 'experimenterPassword',
  hostUrl = 'hostUrl',
  runWithNgrok = 'runWithNgrok',
  isProjectInstalled = 'isProjectInstalled',
}

export interface IConfigs {
  [ConfigKeys.hubProcessId]?: number | undefined;
  [ConfigKeys.pythonVersion]?: string | null;
  [ConfigKeys.ngrokAuthToken]?: string | null;
  [ConfigKeys.runWithNgrok]?: string | null;
  [ConfigKeys.openAiToken]?: string | null;
  [ConfigKeys.experimenterPassword]?: string | null;
  [ConfigKeys.hostUrl]?: string | null;
  [ConfigKeys.isProjectInstalled]?: string | null;
}

export interface ILaunchCommand {
  enableOpenFace?: boolean;
  enableNgrok?: boolean;
  enableOpenAi?: boolean;
  enableExperimenterPassword?: boolean;
}

export interface IResult {
  topic: topics;
  service: string;
  data: null | boolean | any;
  msg: any;
}
