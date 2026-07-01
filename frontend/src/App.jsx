import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Trash2, CheckCircle, Clock, AlertCircle, Plus, Filter, 
  ArrowUpDown, Search, CheckSquare, LayoutGrid, Calendar, ArrowRight, Bell
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      let url = `${API_URL}?sortBy=${sortBy}`;
      if (statusFilter !== 'All') url += `&status=${statusFilter}`;
      if (priorityFilter !== 'All') url += `&priority=${priorityFilter}`;

      const res = await axios.get(url);
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to fetch tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, sortBy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    try {
      const res = await axios.post(API_URL, { title, description, priority });
      setTasks([res.data, ...tasks]);
      setTitle('');
      setDescription('');
      setPriority('Medium');
      toast.success('Task created successfully');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    let nextStatus = 'Pending';
    if (currentStatus === 'Pending') nextStatus = 'In Progress';
    if (currentStatus === 'In Progress') nextStatus = 'Completed';

    try {
      const res = await axios.put(`${API_URL}/${id}`, { status: nextStatus });
      setTasks(tasks.map(task => task._id === id ? res.data : task));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
      toast.success('Task removed');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const dynamicPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const filteredTasksBySearch = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#DFE4E8] text-[#2C3E50] font-sans antialiased flex flex-col">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '8px', background: '#2C3E50', color: '#FFF' } }} />
      
      <header className="h-14 bg-[#34495E] text-white px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#3498DB]" />
          <span className="font-bold text-lg tracking-wide uppercase">TaskFlow Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-slate-300 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 border-l border-white/20 pl-4">
            <div className="h-8 w-8 bg-[#3498DB] rounded-full flex items-center justify-center font-bold text-xs shadow-inner text-white">
              AU
            </div>
            <div className="text-left text-[11px] hidden md:block">
              <p className="font-bold leading-none">Admin User</p>
              <p className="text-slate-300 font-mono mt-0.5">id: admin@gmail.com</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        
        <div className="w-full md:w-64 bg-[#3E5569] text-white p-5 flex flex-col justify-between shrink-0 shadow-md">
          <div className="space-y-6">
            <div className="text-center py-4 border-b border-white/10">
              <h2 className="text-2xl font-serif tracking-widest text-slate-100 italic">task feed</h2>
              <span className="text-[10px] font-mono tracking-widest text-[#95A5A6] uppercase">Control Layer v1.0</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-300 tracking-wider mb-2">
                <span>YOUR PROGRESS</span>
                <span className="font-bold text-[#3498DB]">{dynamicPercentage}%</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#3498DB] h-full transition-all duration-300"
                  style={{ width: `${dynamicPercentage}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3.5 text-center text-xs font-semibold">
                <div className="bg-white/10 p-2 rounded-lg">
                  <p className="text-[10px] text-slate-300 font-normal">Total Tasks</p>
                  <p className="text-base font-bold text-white">{totalTasksCount}</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <p className="text-[10px] text-slate-300 font-normal">Completed</p>
                  <p className="text-base font-bold text-[#2ECC71]">{completedTasksCount}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block pt-4 border-t border-white/10 font-mono text-[10px] text-slate-400">
            &copy; {new Date().getFullYear()} All rights reserved
          </div>
        </div>

        <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">

          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-400/60 flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
              <input
                type="text"
                placeholder="Search parameters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:bg-white focus:border-[#3498DB] transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end font-semibold text-[11px]">
              <div className="flex items-center gap-1 bg-[#3498DB] text-white px-2.5 py-1.5 rounded-md shadow-sm">
                <Filter className="w-3 h-3" /> Filter
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[#2C3E50] focus:outline-none text-xs shadow-sm"
              >
                <option value="All">All Pipelines</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[#2C3E50] focus:outline-none text-xs shadow-sm"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[#2C3E50] focus:outline-none text-xs shadow-sm"
              >
                <option value="newest">Newest tasks</option>
                <option value="oldest">Oldest tasks</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            
            <div className="lg:col-span-2 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm lg:sticky lg:top-6">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 text-[#34495E]">
                <Plus className="w-3.5 h-3.5 text-[#3498DB]" /> Add New Task
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Task Title *</label>
                  <input
                    type="text"
                    placeholder="Enter task title..."
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError(''); }}
                    className={`w-full px-3 py-2 border text-xs rounded-xl font-medium focus:outline-none focus:border-[#3498DB] ${error ? 'border-red-400 bg-red-50/20' : 'border-slate-200 bg-[#F8FAFC]'}`}
                  />
                  {error && <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1 font-semibold"><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">DESCRIPTION (OPTIONAL)</label>
                  <textarea
                    placeholder="Enter any specific details..."
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border text-xs rounded-xl font-medium border-slate-200 bg-[#F8FAFC] focus:outline-none focus:border-[#3498DB] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Priority</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {['Low', 'Medium', 'High'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-1.5 border rounded-xl font-bold transition-all ${priority === p ? 'bg-[#3498DB] text-white border-transparent shadow-sm' : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#34495E] hover:bg-[#2C3E50] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 mt-2 uppercase tracking-wide shadow-sm"
                >
                  ADD <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            <div className="lg:col-span-3 space-y-3">
              {filteredTasksBySearch.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-6">
                  <LayoutGrid className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">No matching clusters</p>
                </div>
              ) : (
                filteredTasksBySearch.map((task) => (
                  <div
                    key={task._id}
                    className={`bg-white p-4 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4 relative group shadow-sm hover:shadow transition-all ${task.status === 'Completed' ? 'bg-slate-50/80 opacity-70' : ''}`}
                  >
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${task.priority === 'High' ? 'text-red-600 border-red-200 bg-red-50/40' : task.priority === 'Medium' ? 'text-amber-600 border-amber-200 bg-amber-50/40' : 'text-emerald-600 border-emerald-200 bg-emerald-50/40'}`}>
                          {task.priority}
                        </span>
                        <h3 className={`font-bold text-sm text-[#2C3E50] tracking-tight ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h3>
                      </div>
                      
                      {task.description && (
                        <p className={`text-xs text-slate-500 leading-relaxed ${task.status === 'Completed' ? 'line-through text-slate-300' : ''}`}>
                          {task.description}
                        </p>
                      )}

                      <div className="pt-1 flex items-center gap-3 text-[10px] font-semibold text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(task._id, task.status)}
                          className={`px-2 py-0.5 border text-[9px] font-bold tracking-wider rounded-md transition-all uppercase ${task.status === 'Completed' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : task.status === 'In Progress' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                        >
                          {task.status}
                        </button>
                        
                        <span className="text-slate-400 font-normal flex items-center gap-1"><Calendar className="w-3 h-3 text-[#3498DB]" /> {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(task._id)}
                      className="text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all shrink-0 md:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}