import TopicDetailView from '@/components/TopicDetailView';
import { questionsData } from '@/constants/questionsData';

export default function AuDelaScreen() {
  return <TopicDetailView categoryIndex={3} questionsData={questionsData} />;
}
