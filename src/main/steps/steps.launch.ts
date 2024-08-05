import fs from 'fs';
// import ngrok from '@ngrok/ngrok';
import kill from 'tree-kill';
import ngrok from 'ngrok';
import { getAppPath } from '../helpers/appData';
import {
  binPath,
  findPythonVersion,
  runLiveShellCommand,
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

// eslint-disable-next-line import/prefer-default-export
export const stepsLaunch = async (
  type: string,
  message: string,
): Promise<IGenericMessage> => {
  let operationResult: IGenericMessage = {};

  let launchCommand: ILaunchCommand;
  if (message) {
    launchCommand = JSON.parse(message) as ILaunchCommand;
  }

  if (type === 'launch') {
    const path = `${getAppPath()}/repo/backend`;
    if (!fs.existsSync(path)) {
      return {
        err: 'Repo does not exist.',
      };
    }
    const hubProcess = runLiveShellCommand(
      `cd "${path}" && ${venvActivation()} && ${await findPythonVersion()} "${path}"/main.py`,
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
          // if (
          //   launchCommand.enableNgrok &&
          //   runTimeMemory[ConfigKeys.ngrokAuthToken]
          // ) {
          //   try {
          //     const listener = await ngrok.forward({
          //       addr: 8080,
          //       authtoken: runTimeMemory[ConfigKeys.ngrokAuthToken],
          //     });
          //     ngrokUrl = listener.url() || ngrokUrl;
          //     runTimeMemory[ConfigKeys.runWithNgrok] = listener;
          //   } catch (e) {
          //     console.log(
          //       `[ERROR] Error while running application via ngrok: ${e}`,
          //     );
          //   }
          // }
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
    mainWindow?.webContents.send('syntharium', {
      topic: topics.liveLog,
      data: { serverStopped: true },
    });
  }
  return operationResult;
};
