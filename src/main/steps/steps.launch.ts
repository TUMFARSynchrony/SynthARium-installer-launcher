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
      console.log(
        'Repository is updated for launching with experimenter password.',
      );
    } catch (e) {
      console.error(
        `Unable to update the repository for experimenter password due to following error ${e}`,
      );
    }
  }
  if (launchCommand.enableOpenAi && runTimeMemory[ConfigKeys.openAiToken]) {
    try {
      const filePath = path.join(directoryPath, '..', 'frontend', '.env');
      const file = fs.readFileSync(filePath);
      const fileStr = file
        .toString()
        .replace(
          /ADD_YOUR_API_KEY_HERE/i,
          runTimeMemory[ConfigKeys.openAiToken],
        );
      fs.writeFileSync(filePath, fileStr);
      console.log(
        'Repository is updated for launching with experimenter password.',
      );
    } catch (e) {
      console.error(
        `Unable to update the repository for experimenter password due to following error ${e}`,
      );
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
        console.log('Repository is updated for launching with open face.');
      } catch (e) {
        console.error(
          `Unable to update the repository for open face setting due to following error ${e}`,
        );
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
    console.log('Launching the SynthARium application.');
    const backendPath = `${getAppPath()}/repo/backend`;
    if (!fs.existsSync(backendPath)) {
      const errMessage = 'SynthARium repository does not exist.';
      console.error(errMessage);
      return {
        err: errMessage,
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
          console.log('SynthARium project is running.');
          let ngrokUrl = 'http://127.0.0.1:8080';

          if (
            launchCommand.enableNgrok &&
            runTimeMemory[ConfigKeys.ngrokAuthToken]
          ) {
            console.log('Serving the localhost url to global network.');
            ngrokUrl = await ngrok.connect({
              authtoken: runTimeMemory[ConfigKeys.ngrokAuthToken],
              addr: 8080,
              binPath,
            });
            runTimeMemory[ConfigKeys.runWithNgrok] = 'true';
          }
          runTimeMemory[ConfigKeys.hostUrl] = ngrokUrl;
          console.log(`Application is running on: ${ngrokUrl}`);
          mainWindow?.webContents.send('syntharium', {
            topic: topics.liveLog,
            data: {
              serverStarted: true,
              hostUrl: runTimeMemory[ConfigKeys.hostUrl],
            },
          });
        }
        if (data.match(/address already in use/i)) {
          console.error(
            'Unable to launch the application. Address already in use',
          );
          if (runTimeMemory[ConfigKeys.runWithNgrok] === 'true') {
            await ngrok.disconnect();
          }
          if (runTimeMemory[ConfigKeys.hubProcessId]) {
            kill(runTimeMemory[ConfigKeys.hubProcessId]);
            runTimeMemory[ConfigKeys.hubProcessId] = 0;
            runTimeMemory[ConfigKeys.hostUrl] = '';
          }
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
      console.log('Terminating the SynthARium process.');
      try {
        if (runTimeMemory[ConfigKeys.runWithNgrok] === 'true') {
          console.log('Disconnecting from ngrok.');
          await ngrok.disconnect();
        }
      } catch (e) {
        console.error(
          `Cannot disconnect from NGROK due to following error: ${e}`,
        );
      }
      try {
        kill(runTimeMemory[ConfigKeys.hubProcessId]);
        runTimeMemory[ConfigKeys.hubProcessId] = 0;
        runTimeMemory[ConfigKeys.hostUrl] = '';
      } catch (e) {
        console.error(
          `Unable to kill the SynthARium process due to following error: ${e}`,
        );
      }
    }
    runTimeMemory[ConfigKeys.runWithNgrok] = undefined;
    console.log('Revert the changes in the repository.');
    await runShellCommandSync(
      `cd "${getAppPath()}/repo/" && git checkout -- *`,
    );
    console.log('Changes in the repository are restored.');
    mainWindow?.webContents.send('syntharium', {
      topic: topics.liveLog,
      data: { serverStopped: true },
    });
  }
  return operationResult;
};
