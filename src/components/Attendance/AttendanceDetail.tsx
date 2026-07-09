import { ArrowLeft, Download, Calendar, Clock, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const AttendanceDetail = ({ 
  handleBack, handleExport, loading, attendanceRecords, 
  currentPage, setCurrentPage, handleDelete 
}: any) => {
  const itemsPerPage = 10;
  const totalPages = Math.ceil(attendanceRecords.length / itemsPerPage);
  const currentRecords = attendanceRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDuration = (hoursVal: any) => {
    if (hoursVal == null || isNaN(Number(hoursVal)) || Number(hoursVal) <= 0) return '-';
    const totalMinutes = Math.round(Number(hoursVal) * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div>
      <button onClick={handleBack} className="group flex items-center gap-2 text-slate-500 hover:text-[#3b82f6] text-sm font-semibold transition-all mb-6 px-3 py-1.5 rounded-lg hover:bg-blue-50 -ml-3">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to Attendance
      </button>
      <Card className="rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-50">
          <div><h2 className="text-xl font-bold text-slate-800">Detailed Attendance Records</h2><p className="text-sm text-slate-500 mt-1">Complete history of check-ins and check-outs</p></div>
          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2 rounded-xl border-gray-200 text-slate-600 hover:bg-slate-50 font-semibold px-4 py-2"><Download className="w-4 h-4" /> Export</Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <p className="text-center py-10">Loading...</p> : attendanceRecords.length === 0 ? <p className="text-center py-10 text-muted-foreground">No records found</p> : (
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100" style={{ background: 'linear-gradient(90deg, #F9FAFB 0%, #F3F4F6 100%)' }}>
                    <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider whitespace-nowrap">Date</TableHead>
                    <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider whitespace-nowrap">Status</TableHead>
                    <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider whitespace-nowrap">Check-in Time</TableHead>
                    <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider whitespace-nowrap">Check-out Time</TableHead>
                    <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider whitespace-nowrap">Duration</TableHead>
                    <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider text-right w-24 whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRecords.map((r: any) => (
                    <TableRow key={r.id || `${r.student_id}_${r.date}`} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                      <TableCell className="py-4 px-6 font-semibold text-[#101828] whitespace-nowrap">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#99A1AF]" />{r.date}</span>
                      </TableCell>
                      <TableCell className="py-4 px-6 whitespace-nowrap">
                        {r.status ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.status.toLowerCase() === 'present' ? 'bg-green-50 text-green-700 border border-green-150' : r.status.toLowerCase() === 'absent' ? 'bg-red-50 text-red-700 border border-red-150' : 'bg-amber-50 text-amber-700 border border-amber-150'}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
                        ) : <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell className="py-4 px-6 font-semibold text-[#364153] whitespace-nowrap">
                        {r.check_in && r.check_in !== '-' ? <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#10B981]" />{r.check_in}</span> : <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell className="py-4 px-6 font-semibold text-[#364153] whitespace-nowrap">
                        {r.check_out && r.check_out !== '-' ? <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#EF4444]" />{r.check_out}</span> : <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell className="py-4 px-6 whitespace-nowrap">
                        {r.duration_hours && Number(r.duration_hours) > 0 ? (
                          <div className="flex flex-col gap-1.5 w-28">
                            <span className="font-bold text-[#10B981] text-sm">{formatDuration(r.duration_hours)}</span>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min((Number(r.duration_hours) / 8) * 100, 100)}%` }} />
                            </div>
                          </div>
                        ) : <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right whitespace-nowrap">
                        {r.id ? (
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl" onClick={() => handleDelete(r.id)}><Trash2 className="h-4.5 w-4.5" /></Button>
                        ) : <span className="text-slate-350">-</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center p-6 border-t border-slate-50 bg-slate-50/20">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="text-slate-600 border-gray-200 rounded-xl hover:bg-slate-50 h-9 font-semibold">Previous</Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    const start = currentPage === totalPages && totalPages > 1 ? currentPage - 1 : currentPage;
                    return page === start || page === start + 1;
                  })
                  .map(page => (
                  <Button key={page} variant="outline" size="sm" onClick={() => setCurrentPage(page)} className={`w-9 h-9 p-0 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === page ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white border-transparent shadow-sm' : 'text-slate-600 hover:bg-slate-50 border-gray-200'}`}>{page}</Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="text-slate-600 border-gray-200 rounded-xl hover:bg-slate-50 h-9 font-semibold">Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
