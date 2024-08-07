import { IGenericMessage } from '../../constants/interfaces';
import { stepNames } from '../../constants/stepNames';
import { findPythonVersion, runShellCommandSync } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export const stepsTest = async (service: string) => {
  let operationResult: IGenericMessage = {};
  if (service === stepNames.python) {
    operationResult = await runShellCommandSync(
      `${await findPythonVersion()} --version`,
    );
  } else if (service === stepNames.node) {
    operationResult = await runShellCommandSync('node --version');
  } else if (service === stepNames.git) {
    operationResult = await runShellCommandSync('git --version');
  } else if (service === stepNames.ngrok) {
    operationResult = { err: null };
  } else if (service === stepNames.openFace) {
    operationResult = { err: null };
  } else if (service === stepNames.experimenterPassword) {
    operationResult = { err: null };
  } else if (service === stepNames.installProject) {
    operationResult = { err: null };
  }
  return operationResult;
};
