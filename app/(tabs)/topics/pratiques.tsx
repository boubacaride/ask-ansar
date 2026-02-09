import TopicDetailView from '@/components/TopicDetailView';
import { questionsData } from '@/constants/questionsData';

export default function PratiquesScreen() {
  return <TopicDetailView categoryIndex={1} questionsData={questionsData} />;
}
