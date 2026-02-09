import TopicDetailView from '@/components/TopicDetailView';
import { questionsData } from '@/constants/questionsData';

export default function CoranScreen() {
  return <TopicDetailView categoryIndex={5} questionsData={questionsData} />;
}
