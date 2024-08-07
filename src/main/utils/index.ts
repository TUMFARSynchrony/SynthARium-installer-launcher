/* eslint-disable no-use-before-define */
import { URL } from 'url';
import path, { join } from 'path';
import { spawn } from 'node:child_process';
import kill from 'tree-kill';
// import ngrok from '@ngrok/ngrok';
import OpenAI from 'openai';
import os from 'os';
import fs from 'fs';
import { authtoken, connect } from 'ngrok';
import runTimeMemory, { DOCKER_IMAGE } from '../helpers/runTimeMemory';
import { ConfigKeys, IGenericMessage } from '../../constants/interfaces';
import { getAppPath, upsertConfigToConfigFile } from '../helpers/appData';
import downloadNgrok from './download';

export const getOsPlatform = (): string => {
  return os.platform();
};

export const getArchitecture = (): string => {
  return process.arch;
};

export const killNgrokProcess = (pid: number | undefined) => {
  if (pid) {
    kill(pid);
  }
};

export const binPath = () => `${getAppPath()}/bin`;

export const downloadBinary = async (): Promise<string> => {
  const binaryLocations = [
    join(binPath(), 'ngrok'),
    join(binPath(), 'ngrok.exe'),
  ];
  if (binaryLocations.some((binaryPath: string) => fs.existsSync(binaryPath))) {
    console.info('ngrok binary is already downloaded');
    return '';
  }
  if (!fs.existsSync(binPath())) {
    fs.mkdirSync(binPath(), { recursive: true });
  }
  try {
    const res: string = await new Promise<string>((resolve, reject) => {
      downloadNgrok((error: any) => (error ? reject(error) : resolve('')), {});
    });
    return res;
  } catch (error: any) {
    console.log(
      `Can't update ngrok binary. The extension may not work correctly.`,
    );
    console.error(error);
    return error;
  }
};

export const setNgrokAuthToken = async (
  token: string,
): Promise<IGenericMessage> => {
  try {
    const downloadBinaryRes = await downloadBinary();
    if (downloadBinaryRes) {
      return {
        err: `'Unable to download binary file of ngrok. ${downloadBinaryRes}'`,
      };
    }
    try {
      await authtoken({
        authtoken: token,
        binPath,
      });
      await connect({ addr: 8080, binPath });
      upsertConfigToConfigFile(ConfigKeys.ngrokAuthToken, token);
    } catch (e) {
      upsertConfigToConfigFile(ConfigKeys.ngrokAuthToken, '');
      return {
        err: 'Ngrok authentication token is wrong. Please check and validate your token.',
      };
    }
    return {
      message: 'Ngrok authentication token is successfully saved.',
    };
  } catch (e) {
    upsertConfigToConfigFile(ConfigKeys.ngrokAuthToken, '');
    console.log(`[ERROR] Error while initializing the ngrok credentials: ${e}`);
    return {
      err: e,
    };
  }
};

export const setOpenAiAuthToken = async (
  token: string,
): Promise<IGenericMessage> => {
  try {
    const openai = new OpenAI({
      apiKey: token,
      dangerouslyAllowBrowser: true,
    });

    const validKey = async () => {
      try {
        await openai.models.list();
        return true;
      } catch (error) {
        return false;
      }
    };

    const result = await validKey();
    console.log('result', result);
    if (!result) {
      console.log(`[ERROR] Error while initializing the openAi credentials`);
      return {
        err: 'Auth token is not valid for openAi',
      };
    }
    upsertConfigToConfigFile(ConfigKeys.openAiToken, token);
    return {
      message: 'OpenAi authentication successfully completed!',
    };
  } catch (e) {
    console.log(
      `[ERROR] Error while initializing the openAi credentials: ${e}`,
    );
    return {
      err: e,
    };
  }
};

export const setExperimenterPassword = (token: string): IGenericMessage => {
  try {
    upsertConfigToConfigFile(ConfigKeys.experimenterPassword, token);
    return {
      message: 'Experimenter password successfully saved.',
    };
  } catch (e) {
    return {
      err: e,
    };
  }
};

export const installDockerDependencies = async (
  next: any,
): Promise<IGenericMessage> => {
  let operationResult: IGenericMessage = {};
  next('Checking for docker installation in your computer.\n');
  operationResult = await runShellCommandSync('docker --version');
  if (operationResult.err) {
    next(
      'Unable to find docker in your computer. Please check your installation and make sure you added docker to your environment variables.\n',
    );
    return operationResult;
  }
  next('Checking for docker image in your computer.\n');
  operationResult = await runShellCommandSync(
    `docker image inspect ${DOCKER_IMAGE}`,
  );
  if (!JSON.parse(operationResult.message || '[]').length) {
    next(
      'Unable to find the open face docker image. Now, the installation operation is starting. It will take some time.\n',
    );
    operationResult = await runSyncLiveShellCommand(
      `docker pull ${DOCKER_IMAGE}`,
      (error: string, message: string) => {
        next(error || message);
      },
      { exitCodeShouldBe0: true },
    );
    if (operationResult.err) {
      next(
        `Unable to find pull the open face docker image. Error is: ${operationResult.err}\n`,
      );
    } else {
      next('Image successfully downloaded.\n');
    }
  } else {
    next('Requested open face docker image exists in your computer.\n');
  }
  return operationResult;
};

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export const runShellCommandSync = async (
  command: string,
): Promise<IGenericMessage> => {
  const runCommand = async (innerCommand: string) => {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(innerCommand, { shell: true });
      childProcess.stdout.on('data', (data) => {
        resolve(data.toString());
      });
      childProcess.stderr.on('data', (data) => {
        reject(data.toString());
      });
      childProcess.on('exit', (code) => {
        resolve(code?.toString() || '');
      });
    });
  };
  try {
    return {
      message: (await runCommand(command)) as string, // execSync(command, { shell: "/bin/bash" }).toString(),
    };
  } catch (error) {
    console.log(`[ERROR] Error while executing the shell command: ${error}`);
    return {
      err: error,
    };
  }
};

export const runLiveShellCommand = (command: string, next: any) => {
  const childProcess = spawn(command, { shell: true });

  childProcess.stdout.on('data', (data) => {
    next(null, data.toString());
  });
  childProcess.stderr.on('data', (data) => {
    next(null, data.toString());
  });
  childProcess.on('error', (error) => {
    next(error.message.toString());
  });
  childProcess.on('exit', (code) => {
    next(null, null, `${code}`);
  });
  return childProcess;
};

export const venvActivation = () => {
  if (getOsPlatform() === 'win32') {
    return '.\\exp-hub-venv\\Scripts\\activate';
  }
  return 'source exp-hub-venv/bin/activate';
};

export const runSyncLiveShellCommand = (
  command: string,
  next: any,
  options: any,
): Promise<IGenericMessage> => {
  return new Promise((resolve) => {
    const childProcess = spawn(command, { shell: true });

    childProcess.stdout.on('data', (data) => {
      next(null, data.toString());
    });
    childProcess.stderr.on('data', (data) => {
      next(null, data.toString());
    });
    childProcess.on('exit', (code) => {
      console.log(
        `[INFO] Shell command execution finished with the following code: ${code}`,
      );
      if (options.exitCodeShouldBe0 && code !== 0) {
        next(null, `operation finished with ${code}!\n`);
        resolve({ err: `Operation finished with ${code}!\n` });
      } else {
        next(null, `operation finished with ${code}!\n`);
        resolve({ message: `Operation finished with ${code}!\n` });
      }
    });
  });
};

// eslint-disable-next-line consistent-return
export const findPythonVersion = async () => {
  const checkVersion = (version: string) => {
    if (version.match(/3\.12/)) return false;
    return version.match(/Python\s*3\.1[0-9](\.[0-9]+)*/i);
  };
  let operationResult;
  if (runTimeMemory.pythonVersion) {
    return runTimeMemory.pythonVersion;
  }
  operationResult = await runShellCommandSync('python3.10 --version');
  if (
    !operationResult.err &&
    operationResult.message &&
    checkVersion(operationResult.message)
  ) {
    runTimeMemory.pythonVersion = 'python3.10';
    return runTimeMemory.pythonVersion;
  }
  operationResult = await runShellCommandSync('python3.11 --version');
  if (
    !operationResult.err &&
    operationResult.message &&
    checkVersion(operationResult.message)
  ) {
    runTimeMemory.pythonVersion = 'python3.11';
    return runTimeMemory.pythonVersion;
  }
  operationResult = await runShellCommandSync('python3 --version');
  if (
    !operationResult.err &&
    operationResult.message &&
    checkVersion(operationResult.message)
  ) {
    runTimeMemory.pythonVersion = 'python3';
    return runTimeMemory.pythonVersion;
  }
  operationResult = await runShellCommandSync('python --version');
  if (
    !operationResult.err &&
    operationResult.message &&
    checkVersion(operationResult.message)
  ) {
    runTimeMemory.pythonVersion = 'python';
    return runTimeMemory.pythonVersion;
  }
};

// import { exec, execSync } from 'child_process';
// import sudo from 'sudo-prompt';

// const options = {
//   name: 'Electron',
// };
// export const runSudoShellCommand = async (command: string, next: any) => {
//   sudo.exec(command, options, function (error, stdout) {
//     if (error) next(error);
//     next(null, stdout);
//   });
// };
