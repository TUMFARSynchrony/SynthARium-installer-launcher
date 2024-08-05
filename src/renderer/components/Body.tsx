import { IBodyProps } from '../interfaces/props';
import Contents from './Contents';
import Steps from './Steps';

function Body(props: IBodyProps) {
  const { contents, step, setStep, isPageLoading, isOperationLoading } = props;
  return (
    <div className="mt-5 grid grid-cols-10 px-2">
      <Steps
        contents={contents}
        setStep={setStep}
        isOperationLoading={isOperationLoading}
      />
      <Contents
        content={contents[step]}
        isPageLoading={isPageLoading}
        isOperationLoading={isOperationLoading}
      />
    </div>
  );
}

export default Body;
