import { ConfigKeys, IGenericMessage } from '../../constants/interfaces';
import { stepNames } from '../../constants/stepNames';
import topics from '../../constants/topics';
import {
  createFolderIfNotExist,
  upsertConfigToConfigFile,
} from '../helpers/appData';
import runTimeMemory, {
  GITHUB_BRANCH,
  GITHUB_URL,
} from '../helpers/runTimeMemory';
// eslint-disable-next-line import/no-cycle
import { mainWindow } from '../main';
import {
  findPythonVersion,
  fixTorchVersionRequirements,
  getArchitecture,
  getOsPlatform,
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
          ? `Unable to configure ngrok authentication because of the following error: ${operationResult.err}`
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
    operationResult = await installDockerDependencies(
      (message: string, log?: boolean) => {
        mainWindow?.webContents.send('syntharium', {
          topic: topics.liveLog,
          data: {
            logs: message,
          },
        });
        if (!log) {
          console.log((message || '').replace(/\n/g, ''));
        }
      },
    );
    const message = operationResult.err
      ? `Unable to configure open face due to following error: ${operationResult.err}\n`
      : 'Openface successfully configured.\n';
    if (operationResult.err) {
      console.error(message);
    } else {
      console.log(message);
    }
    mainWindow?.webContents.send('syntharium', {
      topic: topics.liveLog,
      data: {
        logs: message,
      },
    });
  } else if (service === stepNames.installProject) {
    let msg;
    runTimeMemory[ConfigKeys.isProjectInstalled] = 'false';
    upsertConfigToConfigFile(ConfigKeys.isProjectInstalled, 'false');
    const path = createFolderIfNotExist('');
    console.log('Checking the SynthARium repository.');
    operationResult = await runShellCommandSync(
      `cd "${path}/repo" && git status`,
    );
    if (operationResult.err) {
      console.log(
        'Repository could not found. It will be downloaded from git repository.',
      );
      operationResult = await runSyncLiveShellCommand(
        `git clone ${GITHUB_URL} "${path}/repo" && cd "${path}/repo" && git checkout ${GITHUB_BRANCH}`,
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
      console.log('Repository is exist.');
      if (operationResult.message?.match(/changes not staged for commit/i)) {
        console.log('The repository has changes. These will be removed.');
        await runShellCommandSync(`cd "${path}/repo/" && git checkout -- *`);
      }
      console.log('Checking the changes in the remote repository in git.');
      const repoVersion = await runShellCommandSync(
        `cd "${path}/repo" && git fetch origin && git status`,
      );
      if (
        repoVersion.message &&
        repoVersion.message.match(/your branch is behind/i)
      ) {
        msg =
          'There are updates in remote repository. Fetching the latest updates.';
        console.log(msg);
        mainWindow?.webContents.send('syntharium', {
          topic: topics.liveLog,
          data: {
            logs: `${msg} Please wait, it will take a while...\n`,
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
      msg = 'SynthARium repository is successfully downloaded.';
      console.log(msg);
      mainWindow?.webContents.send('syntharium', {
        topic: topics.liveLog,
        data: { logs: `${msg}\n` },
      });

      const backendPath = createFolderIfNotExist('repo/backend');
      const pythonVersion = await findPythonVersion();
      console.log('Installing the backend dependencies.');
      if (getOsPlatform() === 'darwin' && getArchitecture() === 'x64') {
        fixTorchVersionRequirements();
      }
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
        msg = 'Backend dependencies are successfully installed.';
        console.log(msg);
        mainWindow?.webContents.send('syntharium', {
          topic: topics.liveLog,
          data: { logs: `${msg}\n` },
        });

        const frontendPath = createFolderIfNotExist('repo/frontend');

        console.log('Installing the frontend dependencies.');
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
          console.log('Frontend dependencies are successfully installed.');
          console.log('Trying to build frontend repository.');
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
            msg = 'Frontend build is completed.';
            console.log(msg);
            mainWindow?.webContents.send('syntharium', {
              topic: topics.liveLog,
              data: {
                logs: `${msg}\n`,
              },
            });
            runTimeMemory[ConfigKeys.isProjectInstalled] = 'true';
            upsertConfigToConfigFile(ConfigKeys.isProjectInstalled, 'true');
          } else {
            const errMessage = 'Unable to install frontend dependencies.';
            console.error(errMessage);
            mainWindow?.webContents.send('syntharium', {
              topic: topics.liveLog,
              data: { logs: `${errMessage}\n` },
            });
          }
        } else {
          const errMessage = 'Unable to execute npm install command.';
          console.error(errMessage);
          mainWindow?.webContents.send('syntharium', {
            topic: topics.liveLog,
            data: { logs: `${errMessage}\n` },
          });
        }
      } else {
        const errMessage = 'Unable to install backend dependencies.';
        console.error(errMessage);
        mainWindow?.webContents.send('syntharium', {
          topic: topics.liveLog,
          data: { logs: `${errMessage}\n` },
        });
      }
    } else {
      const errMessage = 'Unable to download SynthARium repository.';
      console.error(errMessage);
      mainWindow?.webContents.send('syntharium', {
        topic: topics.liveLog,
        data: { logs: `${errMessage}\n` },
      });
    }
  }
  return operationResult;
};
