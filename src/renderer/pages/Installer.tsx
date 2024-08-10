import { useEffect, useState } from 'react';
import Body from '../components/Body';
import { stepNames } from '../../constants/stepNames';
import topics from '../../constants/topics';
import sectionDescription from '../statics/section.description.json';
import { IMessage } from '../interfaces/message';
import AutoUpdater from '../components/AutoUpdater';

function Installer() {
  const { ipcRenderer } = window.electron;
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const [isSetupTriggered, setIsSetupTriggered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [autoUpdateLogs, setAutoUpdateLogs] = useState('');
  const [step, setStep] = useState(stepNames.python);

  const sendInstallCommand = (type: any, data?: any) => {
    setIsOperationLoading(true);
    ipcRenderer.sendMessage('syntharium', 'runInstallCommand', type, data);
  };

  const sendValidatorCommand = (type: any, data?: any) => {
    setIsOperationLoading(true);
    ipcRenderer.sendMessage('syntharium', 'runValidatorCommand', type, data);
  };

  const sendTestCommand = (type: any) => {
    setIsOperationLoading(true);
    ipcRenderer.sendMessage('syntharium', 'runTestCommand', type);
  };

  const [contents, setContents] = useState({
    [stepNames.python]: {
      name: sectionDescription[stepNames.python].stepName,
      description: sectionDescription[stepNames.python].description,
      buttonName: sectionDescription[stepNames.python].buttonName,
      type: sectionDescription[stepNames.python].type,
      onClick: () => {
        sendValidatorCommand(stepNames.python);
      },
      testButtonClick: () => {
        sendValidatorCommand(stepNames.python);
      },
      nextButtonClick: () => {
        if (contents[stepNames.python].status) {
          setStep(stepNames.node);
        }
      },
      status: false,
      testResult: false,
      msg: '',
    },
    [stepNames.node]: {
      name: sectionDescription[stepNames.node].stepName,
      description: sectionDescription[stepNames.node].description,
      buttonName: sectionDescription[stepNames.node].buttonName,
      type: sectionDescription[stepNames.node].type,
      onClick: () => {
        sendValidatorCommand(stepNames.node);
      },
      testButtonClick: () => {
        sendValidatorCommand(stepNames.node);
      },
      prevButtonClick: () => {
        setStep(stepNames.python);
      },
      nextButtonClick: () => {
        if (contents[stepNames.node].status) {
          setStep(stepNames.git);
        }
      },
      status: false,
      testResult: false,
      msg: '',
    },
    [stepNames.git]: {
      name: sectionDescription[stepNames.git].stepName,
      description: sectionDescription[stepNames.git].description,
      buttonName: sectionDescription[stepNames.git].buttonName,
      type: sectionDescription[stepNames.git].type,
      onClick: () => {
        sendValidatorCommand(stepNames.git);
      },
      testButtonClick: () => {
        sendValidatorCommand(stepNames.git);
      },
      prevButtonClick: () => {
        setStep(stepNames.node);
      },
      nextButtonClick: () => {
        if (contents[stepNames.git].status) {
          setStep(stepNames.ngrok);
        }
      },
      status: false,
      testResult: false,
      msg: '',
    },
    [stepNames.ngrok]: {
      name: sectionDescription[stepNames.ngrok].stepName,
      description: sectionDescription[stepNames.ngrok].description,
      buttonName: sectionDescription[stepNames.ngrok].buttonName,
      type: sectionDescription[stepNames.ngrok].type,
      onClick: (token: string) => {
        sendInstallCommand(stepNames.ngrok, token);
      },
      testButtonClick: () => {
        sendTestCommand('testNgrokButton');
      },
      prevButtonClick: () => {
        setStep(stepNames.git);
      },
      nextButtonClick: () => {
        setStep(stepNames.openAi);
      },
      status: false,
      testResult: false,
      msg: '',
    },
    [stepNames.openAi]: {
      name: sectionDescription[stepNames.openAi].stepName,
      description: sectionDescription[stepNames.openAi].description,
      buttonName: sectionDescription[stepNames.openAi].buttonName,
      type: sectionDescription[stepNames.openAi].type,
      onClick: (token: string) => {
        sendInstallCommand(stepNames.openAi, token);
      },
      testButtonClick: () => {
        sendTestCommand('testOpenAiButton');
      },
      prevButtonClick: () => {
        setStep(stepNames.ngrok);
      },
      nextButtonClick: () => {
        setStep(stepNames.openFace);
      },
      status: false,
      testResult: false,
      msg: '',
    },
    [stepNames.openFace]: {
      name: sectionDescription[stepNames.openFace].stepName,
      description: sectionDescription[stepNames.openFace].description,
      buttonName: sectionDescription[stepNames.openFace].buttonName,
      type: sectionDescription[stepNames.openFace].type,
      onClick: () => {
        sendInstallCommand(stepNames.openFace);
      },
      testButtonClick: () => {
        sendTestCommand('testOpenFace');
      },
      prevButtonClick: () => {
        setStep(stepNames.openAi);
      },
      nextButtonClick: () => {
        setStep(stepNames.experimenterPassword);
      },
      status: false,
      testResult: false,
      msg: '',
      liveLog: true,
    },
    [stepNames.experimenterPassword]: {
      name: sectionDescription[stepNames.experimenterPassword].stepName,
      description:
        sectionDescription[stepNames.experimenterPassword].description,
      buttonName: sectionDescription[stepNames.experimenterPassword].buttonName,
      type: sectionDescription[stepNames.experimenterPassword].type,
      onClick: (token: string) => {
        sendInstallCommand(stepNames.experimenterPassword, token);
      },
      testButtonClick: () => {
        sendTestCommand(stepNames.experimenterPassword);
      },
      prevButtonClick: () => {
        setStep(stepNames.ngrok);
      },
      nextButtonClick: () => {
        setStep(stepNames.installProject);
      },
      status: false,
      testResult: false,
      liveLog: true,
      msg: '',
    },
    [stepNames.installProject]: {
      name: sectionDescription[stepNames.installProject].stepName,
      description: sectionDescription[stepNames.installProject].description,
      buttonName: sectionDescription[stepNames.installProject].buttonName,
      type: sectionDescription[stepNames.installProject].type,
      onClick: () => {
        sendInstallCommand(stepNames.installProject);
      },
      testButtonClick: () => {
        sendTestCommand(stepNames.installProject);
      },
      prevButtonClick: () => {
        setStep(stepNames.experimenterPassword);
      },
      nextButtonClick: () => {
        setStep(stepNames.installProject);
      },
      status: false,
      testResult: false,
      liveLog: true,
      msg: '',
    },
  });

  useEffect(() => {
    const setup = () => {
      if (isPageLoading) {
        return;
      }
      setIsPageLoading(true);
      if (isSetupTriggered) {
        return;
      }
      setIsSetupTriggered(true);
      ipcRenderer.sendMessage('syntharium', 'checkServiceStatuses', true);
    };

    setup();
    ipcRenderer.on('syntharium', (message: any): void => {
      const convertedMessage = message as IMessage;
      console.log('convertedMessage', convertedMessage);
      if (!convertedMessage) {
        return;
      }
      if (convertedMessage.topic === topics.runInstallCommand) {
        const service = stepNames[convertedMessage.service];
        contents[service].status = convertedMessage.data;
        setIsOperationLoading(false);
      } else if (convertedMessage.topic === topics.runTestCommand) {
        const service = stepNames[convertedMessage.service];
        contents[service].testResult = convertedMessage.data;
        setIsOperationLoading(false);
      } else if (convertedMessage.topic === topics.checkServiceStatuses) {
        Object.keys(convertedMessage.data).forEach((service: string) => {
          if (service === 'msg' && convertedMessage.data[service]) {
            if (convertedMessage.data[service].ngrok) {
              contents[stepNames.ngrok].msg =
                convertedMessage.data[service].ngrok;
            }
            if (convertedMessage.data[service].openAi) {
              contents[stepNames.openAi].msg =
                convertedMessage.data[service].openAi;
            }
            if (convertedMessage.data[service].experimenterPassword) {
              contents[stepNames.experimenterPassword].msg =
                convertedMessage.data[service].experimenterPassword;
            }
          } else if (service !== 'msg') {
            contents[service as stepNames].status =
              convertedMessage.data[service];
          }
        });
      } else if (convertedMessage.topic === topics.runValidatorCommand) {
        const service = stepNames[convertedMessage.service];
        contents[service].msg = convertedMessage.msg;
        contents[service].status = convertedMessage.data;
        setIsOperationLoading(false);
      } else if (convertedMessage.topic === topics.autoUpdater) {
        setAutoUpdateLogs(`${convertedMessage.data.logs}\n${autoUpdateLogs}`);
        if (convertedMessage.data.updateAvailable) {
          setUpdateAvailable(true);
        }
      }
      setContents(contents);
      setIsPageLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (updateAvailable) {
    return (
      <div className="flex h-screen flex-col justify-normal">
        <AutoUpdater logs={autoUpdateLogs} />
      </div>
    );
  }
  return (
    <div className="flex h-screen">
      <Body
        contents={contents}
        step={step}
        setStep={(s: string) => setStep(s as stepNames)}
        isPageLoading={isPageLoading}
        isOperationLoading={isOperationLoading}
      />
    </div>
  );
}

export default Installer;
