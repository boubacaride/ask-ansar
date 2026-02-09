import TopicDetailView from '@/components/TopicDetailView';
import { questionsData } from '@/constants/questionsData';

export default function CroyanceScreen() {
  return <TopicDetailView categoryIndex={0} questionsData={questionsData} />;
}
