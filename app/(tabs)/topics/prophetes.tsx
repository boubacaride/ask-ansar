import TopicDetailView from '@/components/TopicDetailView';
import { questionsData } from '@/constants/questionsData';

export default function ProphetesScreen() {
  return <TopicDetailView categoryIndex={4} questionsData={questionsData} />;
}
