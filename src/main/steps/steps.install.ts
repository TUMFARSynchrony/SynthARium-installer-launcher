import { ConfigKeys, IGenericMessage } from '../../constants/interfaces';
import { stepNames } from '../../constants/stepNames';
import topics from '../../constants/topics';
import {
  createFolderIfNotExist,
  upsertConfigToConfigFile,
} from '../helpers/appData';
import runTimeMemory from '../helpers/runTimeMemory';
// eslint-disable-next-line import/no-cycle
import { mainWindow } from '../main';
import {
  findPythonVersion,
  installDockerDependencies,
  runShellCommandSync,
  runSyncLiveShellCommand,
  setExperimenterPassword,
  setNgrokAuthToken,
  setOpenAiAuthToken,
  venvActivation,
} from '../utils';

// eslint-disable-next-line import/prefer-default-export
export const stepsInstall = async (service: string, payload: string) => {
  let operationResult: IGenericMessage = {};
  if (service === stepNames.ngrok) {
    operationResult = await setNgrokAuthToken(payload);
    mainWindow?.webContents.send('syntharium', {
      topic: topics.liveLog,
      data: {
        configurationLog: operationResult.err
          ? `Unable to set ngrok authentication token because of the following error: ${operationResult.err}`
          : 'Ngrok authentication token is successfully saved.',
      },
    });
  } else if (service === stepNames.openAi) {
    operationResult = await setOpenAiAuthToken(payload);
    mainWindow?.webContents.send('syntharium', {
      topic: topics.liveLog,
      data: {
        configurationLog: operationResult.err
          ? `Unable to set OpenAI authentication token because of the following error: ${operationResult.err}`
          : 'OpenAI authentication token is successfully saved.',
      },
    });
  } else if (service === stepNames.experimenterPassword) {
    operationResult = setExperimenterPassword(payload);
    mainWindow?.webContents.send('syntharium', {
      topic: topics.liveLog,
      data: {
        configurationLog: operationResult.err
          ? `Unable to set experimenter password because of the following error: ${operationResult.err}`
          : 'Experimenter password is successfully saved.',
      },
    });
  } else if (service === stepNames.openFace) {
    operationResult = await installDockerDependencies((message: string) => {
      mainWindow?.webContents.send('syntharium', {
        topic: topics.liveLog,
        data: {
          logs: message,
        },
      });
    });
    mainWindow?.webContents.send('syntharium', {
      topic: topics.liveLog,
      data: {
        logs: operationResult.err
          ? `Unable to configure open face due to following error: ${operationResult.err}\n`
          : 'Openface successfully configured.\n',
      },
    });
  } else if (service === stepNames.installProject) {
    runTimeMemory[ConfigKeys.isProjectInstalled] = 'false';
    upsertConfigToConfigFile(ConfigKeys.isProjectInstalled, 'false');
    const path = createFolderIfNotExist('');
    operationResult = await runShellCommandSync(
      `cd "${path}/repo" && git status`,
    );
    if (operationResult.err) {
      operationResult = await runSyncLiveShellCommand(
        `git clone https://github.com/TUMFARSynchrony/SynthARium.git "${path}/repo" && cd "${path}/repo" && git checkout development-without-dlib`,
        (error: string, message: string) => {
          const newMessage = message || '';
          mainWindow?.webContents.send('syntharium', {
            topic: topics.liveLog,
            data: { logs: newMessage },
          });
        },
        { exitCodeShouldBe0: true },
      );
    } else {
      if (operationResult.message?.match(/changes not staged for commit/i)) {
        await runShellCommandSync(`cd "${path}/repo/" && git checkout -- *`);
      }

      const repoVersion = await runShellCommandSync(
        `cd "${path}/repo" && git fetch origin && git status`,
      );
      if (
        repoVersion.message &&
        repoVersion.message.match(/your branch is behind/i)
      ) {
        mainWindow?.webContents.send('syntharium', {
          topic: topics.liveLog,
          data: {
            logs: 'Updating the experimental hub. Please take a while...\n',
          },
        });
        operationResult = await runShellCommandSync(
          `cd "${path}/repo" && git pull`,
        );
      }
      mainWindow?.webContents.send('syntharium', {
        topic: topics.liveLog,
        data: { logs: operationResult.message },
      });
    }

    if (!operationResult.err) {
      mainWindow?.webContents.send('syntharium', {
        topic: topics.liveLog,
        data: { logs: 'SynthARium is successfully downloaded.\n' },
      });

      const backendPath = createFolderIfNotExist('repo/backend');
      const pythonVersion = await findPythonVersion();

      operationResult = await runSyncLiveShellCommand(
        `cd "${backendPath}" && ${pythonVersion} -m venv exp-hub-venv && ${venvActivation()} && ${pythonVersion} -m pip install -r requirements.txt`,
        (error: string, message: string) => {
          const newMessage = message || '';
          mainWindow?.webContents.send('syntharium', {
            topic: topics.liveLog,
            data: { logs: newMessage },
          });
        },
        { exitCodeShouldBe0: true },
      );

      if (!operationResult.err) {
        mainWindow?.webContents.send('syntharium', {
          topic: topics.liveLog,
          data: { logs: 'Backend dependencies are successfully installed.\n' },
        });

        const frontendPath = createFolderIfNotExist('repo/frontend');

        operationResult = await runSyncLiveShellCommand(
          `cd "${frontendPath}" && npm install`,
          (error: string, message: string) => {
            const newMessage = message || '';
            mainWindow?.webContents.send('syntharium', {
              topic: topics.liveLog,
              data: { logs: newMessage },
            });
          },
          { exitCodeShouldBe0: true },
        );
        if (!operationResult.err) {
          operationResult = await runSyncLiveShellCommand(
            `cd "${frontendPath}" && npm run build`,
            (error: string, message: string) => {
              const newMessage = message || '';
              mainWindow?.webContents.send('syntharium', {
                topic: topics.liveLog,
                data: { logs: newMessage },
              });
            },
            { exitCodeShouldBe0: true },
          );
          if (!operationResult.err) {
            mainWindow?.webContents.send('syntharium', {
              topic: topics.liveLog,
              data: {
                logs: 'Frontend dependencies are successfully installed.\n',
              },
            });
            runTimeMemory[ConfigKeys.isProjectInstalled] = 'true';
            upsertConfigToConfigFile(ConfigKeys.isProjectInstalled, 'true');
          } else {
            mainWindow?.webContents.send('syntharium', {
              topic: topics.liveLog,
              data: { logs: 'Unable to install frontend dependencies.\n' },
            });
          }
        } else {
          mainWindow?.webContents.send('syntharium', {
            topic: topics.liveLog,
            data: { logs: 'Unable to execute npm install command.\n' },
          });
        }
      } else {
        mainWindow?.webContents.send('syntharium', {
          topic: topics.liveLog,
          data: { logs: 'Unable to install backend dependencies.\n' },
        });
      }
    } else {
      mainWindow?.webContents.send('syntharium', {
        topic: topics.liveLog,
        data: { logs: 'Unable to download SynthARium.\n' },
      });
    }
  }
  return operationResult;
};
