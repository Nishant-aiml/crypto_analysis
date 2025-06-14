
import React from 'react';
import { Smile, Meh, Frown, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MarketMoodRing: React.FC = () => {
  // This is a placeholder. In a real implementation,
  // this would fetch and combine multiple market indicators.
  const moods = [
    { mood: 'Positive', Icon: Smile, color: 'text-green-400', description: 'Market sentiment is generally positive. Indicators show bullish signs.' },
    { mood: 'Neutral', Icon: Meh, color: 'text-yellow-400', description: 'Market sentiment is mixed. Indicators show a balance of bullish and bearish signs.' },
    { mood: 'Negative', Icon: Frown, color: 'text-red-400', description: 'Market sentiment is generally negative. Indicators show bearish signs.' },
  ];

  // Placeholder: Randomly pick a mood or cycle through them
  const [currentMoodIndex, setCurrentMoodIndex] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMoodIndex(prev => (prev + 1) % moods.length);
    }, 5000); // Change mood every 5 seconds for demo
    return () => clearInterval(timer);
  }, [moods.length]);

  const { mood, Icon, color, description } = moods[currentMoodIndex];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-6 h-6 mr-2 text-pink-400" />
          Market Mood Ring
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <Icon size={64} className={`mx-auto mb-4 ${color}`} />
        <h3 className={`text-2xl font-semibold mb-2 ${color}`}>{mood}</h3>
        <p className="text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-4">(This is a placeholder demonstrating the concept)</p>
      </CardContent>
    </Card>
  );
};

export default MarketMoodRing;
