
export const determineUrgency = (text: string): 'low' | 'medium' | 'high' => {
  const urgentWords = ['emergency', 'help', 'danger', 'urgent', 'now'];
  const matches = urgentWords.filter(word => text.includes(word)).length;
  
  if (matches >= 2) return 'high';
  if (matches >= 1) return 'medium';
  return 'low';
};
