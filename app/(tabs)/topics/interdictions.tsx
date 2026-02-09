import TopicDetailView from '@/components/TopicDetailView';
import { questionsData } from '@/constants/questionsData';

export default function InterdictionsScreen() {
  return <TopicDetailView categoryIndex={7} questionsData={questionsData} />;
}
