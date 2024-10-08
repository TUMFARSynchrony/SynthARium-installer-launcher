import { ConfigKeys, IGenericMessage, IResult } from '../constants/interfaces';
import { stepNames } from '../constants/stepNames';
import topics from '../constants/topics';
import runTimeMemory from './helpers/runTimeMemory';
// eslint-disable-next-line import/no-cycle
import { stepsInstall } from './steps/steps.install';
import { stepsLaunch } from './steps/steps.launch';
import { stepsLauncherStatus } from './steps/steps.launcherStatus';
import { stepsTest } from './steps/steps.test';
import { stepsValidator } from './steps/steps.validator';

// eslint-disable-next-line import/prefer-default-export
export const handleMessage = async (
  topic: topics,
  service: string,
  message: string,
): Promise<IResult> => {
  const result: IResult = {
    topic,
    service,
    data: null,
    msg: '',
  };
  console.log(
    `Trying to handle the incoming message (topic, service, message): (${topic}, ${service}, ${(message || '').replace(/./g, '*')})`,
  );
  let operationResult: IGenericMessage = {};

  if (topic === topics.runValidatorCommand) {
    operationResult = await stepsValidator(service);
    result.data = !operationResult.err;
    result.msg = operationResult.err || operationResult.message;
  } else if (topic === topics.runInstallCommand) {
    operationResult = await stepsInstall(service, message);

    result.data = !operationResult.err;
  } else if (topic === topics.runTestCommand) {
    operationResult = await stepsTest(service);

    result.data = !operationResult.err;
  } else if (topic === topics.launchProject) {
    operationResult = await stepsLaunch(service, message);

    result.data = !operationResult.err;
  } else if (topic === topics.checkServiceStatuses) {
    const pythonStatus = await stepsValidator(stepNames.python);
    const nodeStatus = await stepsValidator(stepNames.node);
    const gitStatus = await stepsValidator(stepNames.git);
    const ngrokStatus = {
      err: !runTimeMemory[ConfigKeys.ngrokAuthToken],
    };
    const openAiStatus = {
      err: !runTimeMemory[ConfigKeys.openAiToken],
    };
    const projectStatus = {
      err: runTimeMemory[ConfigKeys.isProjectInstalled] !== 'true',
    };
    const openFaceStatus = await stepsValidator(stepNames.openFace);
    const experimenterPasswordStatus = {
      err: !runTimeMemory[ConfigKeys.experimenterPassword],
    };

    result.data = {
      python: !pythonStatus.err,
      node: !nodeStatus.err,
      git: !gitStatus.err,
      ngrok: !ngrokStatus.err,
      openAi: !openAiStatus.err,
      experimenterPassword: !experimenterPasswordStatus.err,
      openFace: !openFaceStatus.err,
      installProject:
        !pythonStatus.err &&
        !nodeStatus.err &&
        !gitStatus.err &&
        !projectStatus.err,
      msg: {
        ngrok: runTimeMemory[ConfigKeys.ngrokAuthToken],
        openAi: runTimeMemory[ConfigKeys.openAiToken],
        experimenterPassword: runTimeMemory[ConfigKeys.experimenterPassword],
      },
    };
    result.service = 'serviceStatuses';
  } else if (topic === topics.checkLauncherStatuses) {
    result.data = await stepsLauncherStatus();
  }
  return result;
};
