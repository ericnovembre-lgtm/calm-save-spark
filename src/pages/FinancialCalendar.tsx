import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarGrid } from '@/components/financial-calendar/CalendarGrid';
import { CalendarAgendaView } from '@/components/financial-calendar/CalendarAgendaView';
import { CalendarFilters } from '@/components/financial-calendar/CalendarFilters';
import { CreateEventModal } from '@/components/financial-calendar/CreateEventModal';
import { useFinancialEvents } from '@/hooks/useFinancialEvents';
import { useEventSync } from '@/hooks/useEventSync';
import { Calendar, List, Plus, RefreshCw } from 'lucide-react';

export default function FinancialCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['bill', 'income', 'subscription', 'goal_milestone', 'reminder', 'custom']);
  
  const { events, createEvent, toggleComplete } = useFinancialEvents(selectedDate);
  const { syncAll, isSyncing } = useEventSync();

  const filteredEvents = events.filter(e => selectedTypes.includes(e.event_type));

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6" data-copilot-id="financial-calendar-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Financial Calendar
            </h1>
            <p className="text-muted-foreground">All your financial events in one place</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => syncAll.mutate()} disabled={isSyncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        <CalendarFilters selectedTypes={selectedTypes} onTypesChange={setSelectedTypes} />

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="agenda" className="gap-2">
              <List className="w-4 h-4" />
              Agenda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CalendarGrid
              events={filteredEvents}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onAddEvent={() => setIsCreateOpen(true)}
            />
          </TabsContent>

          <TabsContent value="agenda">
            <CalendarAgendaView
              events={filteredEvents}
              onToggleComplete={(id, completed) => toggleComplete.mutate({ id, is_completed: completed })}
            />
          </TabsContent>
        </Tabs>

        <CreateEventModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(event) => createEvent.mutate(event)}
          defaultDate={selectedDate}
        />
      </div>
    </AppLayout>
  );
}
