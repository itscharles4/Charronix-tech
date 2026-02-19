
import React, { useState } from 'react';
import { Plus, Upload, Search, Edit2, Trash2, Eye, X, User, Phone, Hash, BookOpen, UserPlus } from 'lucide-react';
import { MOCK_STUDENTS } from '../constants';
import { Student } from '../types';
import StudentProfile from './StudentProfile';

const StudentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    admissionNo: '',
    firstName: '',
    lastName: '',
    class: '',
    section: '',
    rollNo: '',
    parentName: '',
    parentPhone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const studentToAdd: Student = {
      id: Date.now().toString(),
      admissionNo: newStudent.admissionNo,
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      class: newStudent.class,
      section: newStudent.section,
      rollNo: parseInt(newStudent.rollNo) || 0,
      parentName: newStudent.parentName,
      parentPhone: newStudent.parentPhone,
      status: 'ACTIVE',
      overallAttendance: 0,
      achievements: [],
      communicationLogs: [],
      academicGrades: [],
      medicalInfo: {
        bloodGroup: '',
        allergies: [],
        chronicConditions: [],
        lastCheckup: ''
      }
    };

    setStudents([studentToAdd, ...students]);
    setIsAddModalOpen(false);
    setNewStudent({
      admissionNo: '',
      firstName: '',
      lastName: '',
      class: '',
      section: '',
      rollNo: '',
      parentName: '',
      parentPhone: ''
    });
  };

  const getStatusIndicator = (status: string) => {
    const isActive = status === 'ACTIVE';
    return (
      <div className="flex items-center gap-2">
        <div className={`relative flex h-3 w-3`}>
          {isActive && (
            <span className="animate-pulse-green absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600 shadow-inner'}`}></span>
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-500'}`}>
          {status}
        </span>
      </div>
    );
  };

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedStudent) {
    return <StudentProfile student={selectedStudent} onBack={() => setSelectedStudent(null)} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn transition-colors relative">
      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Add New Student</h3>
                  <p className="text-white/70 text-sm font-medium">Enter academic and personal details</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Admission Number</label>
                <div className="relative">
                  <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    name="admissionNo"
                    type="text" required
                    value={newStudent.admissionNo}
                    onChange={handleInputChange}
                    placeholder="ADM2026XXX"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    name="firstName"
                    type="text" required
                    value={newStudent.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    name="lastName"
                    type="text" required
                    value={newStudent.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Roll Number</label>
                <div className="relative">
                  <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    name="rollNo"
                    type="number" required
                    value={newStudent.rollNo}
                    onChange={handleInputChange}
                    placeholder="01"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
                <div className="relative">
                  <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    name="class"
                    required
                    value={newStudent.class}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-white appearance-none"
                  >
                    <option value="">Select Grade</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Section</label>
                <div className="relative">
                  <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    name="section"
                    required
                    value={newStudent.section}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-white appearance-none"
                  >
                    <option value="">Select Section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Parent Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    name="parentName"
                    type="text" required
                    value={newStudent.parentName}
                    onChange={handleInputChange}
                    placeholder="Parent/Guardian Name"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Parent Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    name="parentPhone"
                    type="tel" required
                    value={newStudent.parentPhone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all uppercase tracking-widest text-sm"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, adm no..." 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-12 py-4 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all font-bold text-slate-800 dark:text-slate-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-6 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 font-black transition-all shadow-sm uppercase text-xs tracking-widest">
            <Upload size={18} /> Import
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 font-black transition-all shadow-xl shadow-indigo-100 dark:shadow-none uppercase text-xs tracking-widest"
          >
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Profile</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Admission</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Grade</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Roll</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student) => (
                <tr 
                  key={student.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-sm border border-transparent dark:border-indigo-800">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 dark:text-slate-100 text-lg leading-none">{student.firstName} {student.lastName}</p>
                        <div className="mt-2">{getStatusIndicator(student.status)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm text-slate-500 dark:text-slate-400 font-bold">{student.admissionNo}</td>
                  <td className="px-10 py-6 text-sm text-slate-800 dark:text-slate-100 font-black">{student.class}-{student.section}</td>
                  <td className="px-10 py-6 text-sm text-slate-600 dark:text-slate-400 font-bold">{student.rollNo}</td>
                  <td className="px-10 py-6">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">{student.parentName}</p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{student.parentPhone}</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <button 
                        className="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-2xl transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                        onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="p-3 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-2xl transition-all border border-transparent hover:border-amber-100 dark:hover:border-amber-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="p-3 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-2xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudents(students.filter(s => s.id !== student.id));
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
