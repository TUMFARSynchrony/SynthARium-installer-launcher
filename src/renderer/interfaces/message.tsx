import { stepNames } from '../../constants/stepNames';
import topics from '../../constants/topics';

export interface IMessage {
  topic: topics;
  service: stepNames;
  data: boolean | any;
  msg: string;
}
