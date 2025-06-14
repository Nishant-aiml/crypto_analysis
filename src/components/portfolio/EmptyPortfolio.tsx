
import { Briefcase } from 'lucide-react';

const EmptyPortfolio = () => {
  return (
    <div className="glass-card p-12 rounded-lg text-center">
      <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-xl font-semibold mb-2">No positions yet</h3>
      <p className="text-muted-foreground">Add your first cryptocurrency position to start tracking your portfolio.</p>
    </div>
  );
};

export default EmptyPortfolio;
