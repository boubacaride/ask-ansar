import TopicDetailView from '@/components/TopicDetailView';
import { questionsData } from '@/constants/questionsData';

export default function FamilleScreen() {
  return <TopicDetailView categoryIndex={2} questionsData={questionsData} />;
}
