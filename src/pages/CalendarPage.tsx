import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { mockEvents } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<typeof mockEvents[0] | null>(null);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-primary';
      case 'class': return 'bg-secondary';
      case 'exam': return 'bg-destructive';
      case 'interview': return 'bg-success';
      case 'holiday': return 'bg-muted-foreground';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle>Schedule Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvent ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                  <Badge className={getEventTypeColor(selectedEvent.type)} >
                    {selectedEvent.type}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedEvent.course}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Click on an event below to see details
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.course}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getEventTypeColor(event.type)}>
                    {event.type}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
