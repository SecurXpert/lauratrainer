import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Video, FileText, Eye, CalendarPlus } from 'lucide-react';
import { mockClasses } from '@/data/mockData';
import { toast } from 'sonner';

const Classes = () => {
  const [classes] = useState(mockClasses);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Classes Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2">
            <CalendarPlus className="w-4 h-4" />
            Schedule Class
          </Button>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Availability
          </Button>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>All Classes ({classes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Class ID</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Recording</th>
                  <th className="text-left py-3 px-4">Materials</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classItem) => (
                  <tr key={classItem.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{classItem.id}</td>
                    <td className="py-3 px-4">{classItem.title}</td>
                    <td className="py-3 px-4">{new Date(classItem.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      {classItem.hasRecording ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <Video className="w-4 h-4" />
                          Available
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {classItem.hasMaterials ? (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <FileText className="w-4 h-4" />
                          Available
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {classItem.hasRecording && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.info('Playing recording')}
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Watch
                          </Button>
                        )}
                        {classItem.hasMaterials && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.info('Viewing materials')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Materials
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.success('Viewing notes')}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Notes
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft gradient-card p-6">
        <h3 className="text-lg font-semibold mb-2">Zoom Integration</h3>
        <p className="text-muted-foreground mb-4">
          Connect your Zoom account to enable live classes with automatic recording.
        </p>
        <Button>Connect Zoom Account</Button>
      </Card>
    </div>
  );
};

export default Classes;
