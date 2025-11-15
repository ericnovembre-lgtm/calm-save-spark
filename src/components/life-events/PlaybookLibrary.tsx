import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Home, Baby, Calendar, Briefcase, MapPin, Palmtree } from 'lucide-react';
import { StartPlaybookDialog } from './StartPlaybookDialog';

interface PlaybookLibraryProps {
  playbooks: any[];
}

const EVENT_ICONS: Record<string, any> = {
  marriage: Heart,
  home_purchase: Home,
  new_child: Baby,
  career_change: Briefcase,
  relocation: MapPin,
  retirement: Palmtree,
};

export function PlaybookLibrary({ playbooks }: PlaybookLibraryProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {playbooks.map((playbook) => {
        const Icon = EVENT_ICONS[playbook.event_type] || Calendar;
        const costRange = playbook.estimated_cost_range || { min: 0, max: 0 };
        
        return (
          <Card key={playbook.id} className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{playbook.playbook_name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {playbook.description}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Steps:</span>
                <span className="font-semibold">{playbook.total_steps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Duration:</span>
                <span className="font-semibold">{playbook.estimated_duration_days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Cost:</span>
                <span className="font-semibold">
                  ${costRange.min?.toLocaleString()} - ${costRange.max?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {playbook.financial_checklist && Array.isArray(playbook.financial_checklist) && (
                <Badge variant="outline">{playbook.financial_checklist.length} Financial</Badge>
              )}
              {playbook.legal_checklist && Array.isArray(playbook.legal_checklist) && (
                <Badge variant="outline">{playbook.legal_checklist.length} Legal</Badge>
              )}
              {playbook.administrative_checklist && Array.isArray(playbook.administrative_checklist) && (
                <Badge variant="outline">{playbook.administrative_checklist.length} Admin</Badge>
              )}
            </div>

            <StartPlaybookDialog playbook={playbook}>
              <Button className="w-full">Start This Event</Button>
            </StartPlaybookDialog>
          </Card>
        );
      })}
    </div>
  );
}
