import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Check, X, Video } from 'lucide-react';
import { mockInterviews } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Interviews = () => {
  const [interviews] = useState(mockInterviews);

  const upcomingInterviews = interviews.filter(i => i.status === 'upcoming');
  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const rejectedInterviews = interviews.filter(i => i.status === 'rejected');

  const InterviewTable = ({ interviews, status }: { interviews: typeof mockInterviews, status: string }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Interview ID</th>
            <th className="text-left py-3 px-4">Student</th>
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-left py-3 px-4">Time</th>
            <th className="text-left py-3 px-4">Type</th>
            {status === 'completed' && <th className="text-left py-3 px-4">Result</th>}
            {status === 'rejected' && <th className="text-left py-3 px-4">Reason</th>}
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {interviews.map((interview) => (
            <tr key={interview.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4 font-medium">{interview.id}</td>
              <td className="py-3 px-4">{interview.studentName}</td>
              <td className="py-3 px-4">{new Date(interview.date).toLocaleDateString()}</td>
              <td className="py-3 px-4">{interview.time}</td>
              <td className="py-3 px-4">
                <Badge>{interview.type}</Badge>
              </td>
              {status === 'completed' && (
                <td className="py-3 px-4">
                  <Badge className="bg-success">{interview.result}</Badge>
                </td>
              )}
              {status === 'rejected' && (
                <td className="py-3 px-4 text-muted-foreground">{interview.reason}</td>
              )}
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-2">
                  {status === 'upcoming' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => toast.success('Accepted interview')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => toast.error('Rejected interview')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info('Joining Zoom')}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    </>
                  )}
                  {status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success('Adding result')}
                    >
                      Update Result
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Mock Interviews</h1>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Mock Interview
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Interview Configuration
          </Button>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>All Mock Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming ({upcomingInterviews.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedInterviews.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedInterviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              <InterviewTable interviews={upcomingInterviews} status="upcoming" />
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <InterviewTable interviews={completedInterviews} status="completed" />
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              <InterviewTable interviews={rejectedInterviews} status="rejected" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="shadow-soft gradient-card p-6">
        <h3 className="text-lg font-semibold mb-2">Zoom Integration for Interviews</h3>
        <p className="text-muted-foreground mb-4">
          Enable one-to-one and one-to-many mock interviews with automatic Zoom integration.
        </p>
        <Button>Configure Zoom Settings</Button>
      </Card>
    </div>
  );
};

export default Interviews;
