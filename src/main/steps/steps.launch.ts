import fs from 'fs';
import kill from 'tree-kill';
import ngrok from 'ngrok';
import path from 'path';
import { getAppPath } from '../helpers/appData';
import {
  binPath,
  findPythonVersion,
  runLiveShellCommand,
  runShellCommandSync,
  venvActivation,
} from '../utils';
import runTimeMemory from '../helpers/runTimeMemory';
// eslint-disable-next-line import/no-cycle
import { mainWindow } from '../main';
import topics from '../../constants/topics';
import {
  ConfigKeys,
  IGenericMessage,
  ILaunchCommand,
} from '../../constants/interfaces';
import { stepsValidator } from './steps.validator';
import { stepNames } from '../../constants/stepNames';

const configureRunTimeEnvironment = async (
  directoryPath: string,
  launchCommand: ILaunchCommand,
) => {
  if (
    launchCommand.enableExperimenterPassword &&
    runTimeMemory[ConfigKeys.experimenterPassword]
  ) {
    try {
      const filePath = path.join(directoryPath, 'config.json');
      const file = fs.readFileSync(filePath);
      const fileJson = JSON.parse(file.toString());
      fileJson.experimenter_password =
        runTimeMemory[ConfigKeys.experimenterPassword];
      fs.writeFileSync(filePath, JSON.stringify(fileJson));
    } catch (e) {
      console.error('Unable to read config.json', e);
    }
  }
  if (launchCommand.enableOpenFace) {
    const operationResult = await stepsValidator(stepNames.openFace);
    if (operationResult.message) {
      try {
        const filePath = path.join(directoryPath, 'config.json');
        const file = fs.readFileSync(filePath);
        const fileJson = JSON.parse(file.toString());
        fileJson.open_face_type = 'dockerized';
        fs.writeFileSync(filePath, JSON.stringify(fileJson));
      } catch (e) {
        console.error('Unable to read config.json', e);
      }
    }
  }
};

// eslint-disable-next-line import/prefer-default-export
export const stepsLaunch = async (
  type: string,
  message: string,
): Promise<IGenericMessage> => {
  let operationResult: IGenericMessage = {};

  const launchCommand: ILaunchCommand = JSON.parse(
    message || '{}',
  ) as ILaunchCommand;

  if (type === 'launch') {
    const backendPath = `${getAppPath()}/repo/backend`;
    if (!fs.existsSync(backendPath)) {
      return {
        err: 'Repo does not exist.',
      };
    }
    await configureRunTimeEnvironment(backendPath, launchCommand);
    const hubProcess = runLiveShellCommand(
      `cd "${backendPath}" && ${venvActivation()} && ${await findPythonVersion()} "${backendPath}"/main.py`,
      async (error: any, data: any, exitStatus: any) => {
        if (error) {
          mainWindow?.webContents.send('syntharium', {
            topic: topics.liveLog,
            data: { logs: error },
          });
          return;
        }
        if (exitStatus) {
          mainWindow?.webContents.send('syntharium', {
            topic: topics.liveLog,
            data: { serverStopped: true },
          });
          if (!exitStatus.match(/(null)/i)) {
            mainWindow?.webContents.send('syntharium', {
              topic: topics.liveLog,
              data: { errorLog: exitStatus },
            });
          }
          runTimeMemory.hubProcessId = 0;
          return;
        }
        if (data.match(/starting server/i)) {
          let ngrokUrl = 'http://127.0.0.1:8080';

          if (
            launchCommand.enableNgrok &&
            runTimeMemory[ConfigKeys.ngrokAuthToken]
          ) {
            ngrokUrl = await ngrok.connect({
              authtoken: runTimeMemory[ConfigKeys.ngrokAuthToken],
              addr: 8080,
              binPath,
            });
            runTimeMemory[ConfigKeys.runWithNgrok] = 'true';
          }
          runTimeMemory[ConfigKeys.hostUrl] = ngrokUrl;
          mainWindow?.webContents.send('syntharium', {
            topic: topics.liveLog,
            data: {
              serverStarted: true,
              hostUrl: runTimeMemory[ConfigKeys.hostUrl],
            },
          });
        }
        mainWindow?.webContents.send('syntharium', {
          topic: topics.liveLog,
          data: { logs: data },
        });
      },
    );
    runTimeMemory.hubProcessId = hubProcess.pid;
    operationResult = {
      message: 'ok',
    };
  } else if (type === 'terminate') {
    if (runTimeMemory[ConfigKeys.hubProcessId]) {
      try {
        if (runTimeMemory[ConfigKeys.runWithNgrok] === 'true') {
          await ngrok.disconnect();
        }
      } catch (e) {
        console.log(
          `[ERROR] Cannot disconnect from NGROK with the following error: ${e}`,
        );
      }
      kill(runTimeMemory[ConfigKeys.hubProcessId]);
      runTimeMemory[ConfigKeys.hubProcessId] = 0;
      runTimeMemory[ConfigKeys.hostUrl] = '';
    }
    runTimeMemory[ConfigKeys.runWithNgrok] = undefined;
    await runShellCommandSync(
      `cd "${getAppPath()}/repo/" && git checkout -- *`,
    );
    mainWindow?.webContents.send('syntharium', {
      topic: topics.liveLog,
      data: { serverStopped: true },
    });
  }
  return operationResult;
};
