import { IGenericMessage } from '../../constants/interfaces';
import { stepNames } from '../../constants/stepNames';
import { findPythonVersion, runShellCommandSync } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export const stepsValidator = async (
  service: string,
): Promise<IGenericMessage> => {
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
  }
  return operationResult;
};
