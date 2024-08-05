/* eslint-disable prefer-template */
/* eslint-disable prettier/prettier */
import { Link } from 'react-router-dom';
import { stepNames } from '../../constants/stepNames';
import Step from './Step';
import { IStepsProps } from '../interfaces/props';

function Steps(props: IStepsProps) {
  const { contents, setStep, isOperationLoading } = props;
  return (
    <div className="mx-1 my-1 mr-5 grid grid-cols-1 gap-4 col-span-3">
      {Object.keys(contents).map((key: string, index: number) => (
        <Step
          key={key}
          contents={contents}
          keyName={key}
          index={index}
          onClick={() => setStep(key as stepNames)}
          isOperationLoading={isOperationLoading}
        />
      ))}
      <div className={"font-montserrat border-gray-50 px-4 py-2 pr-0 content-center text-black shadow hover:bg-slate-100  " + (isOperationLoading ? 'cursor-not-allowed' : 'cursor-pointer')}>
        <Link to="/launch">
          <button
            type="button"
            onClick={() => {}}
            className={'w-full text-left ' + ((isOperationLoading || !contents[stepNames.installProject].status) ? 'cursor-not-allowed' : 'cursor-pointer')}
            disabled={!!isOperationLoading || !contents[stepNames.installProject].status}
            title={
              !!isOperationLoading || !contents[stepNames.installProject].status
                ? 'Please complete the steps to navigate to launcher page'
                : ''
            }
          >
            Launcher
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Steps;
