import React, { useState, useEffect, useRef } from "react";
import { 
  BarChart2, Users, BookOpen, Download, Calendar, Loader2, Star, TrendingUp, ShieldCheck
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from "recharts";
import customFetch from "../../../utils/customfetch";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import { format, parseISO, startOfMonth, subMonths, isSameMonth } from "date-fns";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef();

  // Overview metrics
  const [metrics, setMetrics] = useState({
    students: 0,
    tutors: 0,
    materials: 0,
    feedbacks: 0,
    avgRating: 0
  });

  // Chart data
  const [registrationData, setRegistrationData] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, materialsRes, feedbacksRes] = await Promise.all([
        customFetch.get("/auth/all-users"),
        customFetch.get("/materials?limit=1"), // Limit 1 just to get the totalCount header/data payload efficiently
        customFetch.get("/feedbacks")
      ]);

      const allUsers = usersRes.data.users || [];
      const students = allUsers.filter(u => u.role === "user");
      const tutors = allUsers.filter(u => u.role === "tutor");
      
      const materialsCount = materialsRes.data?.pagination?.total || materialsRes.data?.data?.length || 0;
      
      const allFeedbacks = feedbacksRes.data.feedbacks || [];
      const totalRatings = allFeedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0);
      const avgRating = allFeedbacks.length > 0 ? (totalRatings / allFeedbacks.length).toFixed(1) : 0;

      setMetrics({
        students: students.length,
        tutors: tutors.length,
        materials: materialsCount,
        feedbacks: allFeedbacks.length,
        avgRating
      });

      // Calculate last 6 months for chart
      const monthsData = [];
      for (let i = 5; i >= 0; i--) {
        const targetMonth = subMonths(new Date(), i);
        const monthFilter = startOfMonth(targetMonth);
        
        const count = allUsers.filter(u => {
          if (!u.createdAt) return false;
          return isSameMonth(parseISO(u.createdAt), monthFilter);
        }).length;

        monthsData.push({
          name: format(targetMonth, "MMM yyyy"),
          users: count
        });
      }
      setRegistrationData(monthsData);

      setRoleDistribution([
        { name: "Students", count: students.length },
        { name: "Tutors", count: tutors.length }
      ]);

    } catch (error) {
      toast.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setExporting(true);
    const toastId = toast.loading("Generating user-friendly PDF...");
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff", // Always white background for PDF
        onclone: (clonedView) => {
          // 1. Force the cloned DOM into Light Mode for perfect ink-friendly printing
          clonedView.documentElement.classList.remove("dark");
          
          // 2. Hide charts container from PDF entirely per user request
          const chartsWrap = clonedView.getElementById("pdf-charts-wrapper");
          if (chartsWrap) chartsWrap.style.display = "none";

          // 3. Fix SVG serialization bug (btoa)
          const svgs = clonedView.querySelectorAll("svg");
          svgs.forEach(svg => {
            if (!svg.getAttribute("xmlns")) {
              svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            }
          });
        }
      });
      
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdfWidth = 210; // Standard A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Create a custom-sized PDF precisely matching the height of the dashboard contents to prevent shrinking
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pdfWidth, pdfHeight] });
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Platform_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
      
      toast.success("PDF beautifully generated!", { id: toastId });
    } catch (error) {
      console.error("PDF Generator Error", error);
      toast.error("Format error. Using browser fallback...", { id: toastId });
      window.print(); // Bulletproof fallback
    } finally {
      setExporting(false);
    }
  };

  /** Card Component specifically scoped here for simplicity */
  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4 transition-transform hover:scale-[1.02]">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-yellow-600" />
            Platform Reports
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            System analytics and metrics updated in real-time.
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={loading || exporting}
          className="print:hidden flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-60 shadow-sm"
        >
          {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Export PDF
        </button>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aggregating platform metrics...</p>
        </div>
      ) : (
        <div ref={reportRef} className="space-y-6 bg-white dark:bg-gray-900 p-2 sm:p-4 rounded-3xl">
          {/* Header visible primarily in PDF */}
          <div className="hidden print:flex mb-8 border-b pb-4 dark:border-gray-800 flex-col items-center text-center justify-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div 
                className="bg-indigo-600 p-2.5 rounded-2xl shadow-sm flex items-center justify-center w-14 h-14"
                style={{ backgroundColor: '#4f46e5', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
              >
                <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                TutorConnect
              </h1>
            </div>
            <p className="text-lg font-medium text-gray-500">Official Administrative Report</p>
            <p className="text-sm text-gray-400 mt-1">Generated on {format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Students" 
              value={metrics.students} 
              icon={Users} 
              colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400" 
            />
            <StatCard 
              title="Verified Tutors" 
              value={metrics.tutors} 
              icon={BookOpen} 
              colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400" 
            />
            <StatCard 
              title="Study Materials" 
              value={metrics.materials} 
              icon={TrendingUp} 
              colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" 
            />
            <StatCard 
              title="Avg. Feedback Rating" 
              value={`${metrics.avgRating} / 5`} 
              icon={Star} 
              colorClass="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" 
            />
          </div>

          <div id="pdf-charts-wrapper" className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
            {/* Chart 1: Registrations over time */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                Registrations (Last 6 Months)
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={registrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: 'none', color: '#fff' }}
                      itemStyle={{ color: '#eab308', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Role Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                Platform Demographics
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: 'none', color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-6">
            Confidential internal analytical data. Authorized for administrative use only.
          </div>
        </div>
      )}
    </div>
  );
}
