import { IGenericMessage } from '../../constants/interfaces';
import { stepNames } from '../../constants/stepNames';
import { DOCKER_IMAGE } from '../helpers/runTimeMemory';
import { findPythonVersion, runShellCommandSync } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export const stepsValidator = async (
  service: string,
): Promise<IGenericMessage> => {
  console.log(`Validate the incoming service: ${service}`);
  let operationResult: IGenericMessage = {};
  if (service === stepNames.python) {
    operationResult = await runShellCommandSync(
      `${await findPythonVersion()} --version`,
    );
    if (!operationResult.err) {
      operationResult.message = `Success ${operationResult.message} meets the requirements!.`;
    } else {
      operationResult.err = `Python could not found. Please download Python from the following link: https://www.python.org/downloads/release/python-3119/`;
    }
  } else if (service === stepNames.node) {
    operationResult = await runShellCommandSync('node --version');
    if (!operationResult.err) {
      operationResult.message = `Success Node.js ${operationResult.message} meets the requirements!.`;
    } else {
      operationResult.err = `Node.js could not found. Please download Node.js from the following link: https://nodejs.org/en/download/prebuilt-installer/current`;
    }
  } else if (service === stepNames.git) {
    operationResult = await runShellCommandSync('git --version');
    if (!operationResult.err) {
      operationResult.message = `Success ${operationResult.message} meets the requirements!.`;
    } else {
      operationResult.err = `Git could not found. Please download Git from the following link: https://git-scm.com/downloads`;
    }
  } else if (service === stepNames.openFace) {
    operationResult = await runShellCommandSync(
      `docker image inspect ${DOCKER_IMAGE}`,
    );
    if (JSON.parse(operationResult.message || '[]').length) {
      operationResult.message = `Success ${operationResult.message} meets the requirements!.`;
    } else {
      operationResult.err = `Docker image could not found. Please download docker from the following link: https://www.docker.com/products/docker-desktop/`;
    }
  }
  return operationResult;
};
