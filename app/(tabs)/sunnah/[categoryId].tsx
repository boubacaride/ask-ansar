import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { TopicHadithScreen } from '@/components/TopicHadithScreen';

export default function CategoryHadithRoute() {
  const params = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
  }>();

  return (
    <TopicHadithScreen
      categoryId={params.categoryId}
      categoryName={params.categoryName}
      categoryIcon={params.categoryIcon}
      categoryColor={params.categoryColor}
    />
  );
}
