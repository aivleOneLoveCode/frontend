export function generateChatTitle(firstMessage: string): string {
  // 첫 번째 메시지를 기반으로 제목 생성
  const words = firstMessage.split(' ').slice(0, 4);
  let title = words.join(' ');
  
  if (title.length > 30) {
    title = title.substring(0, 27) + '...';
  }
  
  return title || '새로운 채팅';
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString('ko-KR');
}