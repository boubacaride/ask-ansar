import TopicDetailView from '@/components/TopicDetailView';
import { questionsData } from '@/constants/questionsData';

export default function EthiqueScreen() {
  return <TopicDetailView categoryIndex={6} questionsData={questionsData} />;
}
