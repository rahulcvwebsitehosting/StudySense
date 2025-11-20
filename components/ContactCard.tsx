
import React from 'react';
import { Mail, Linkedin, Download, MapPin, ExternalLink } from 'lucide-react';

const ContactCard: React.FC = () => {
  const skills = [
    { name: "AutoCAD", level: "High" },
    { name: "Web Design", level: "High" },
    { name: "Project Mgmt", level: "Med" },
    { name: "IoT Systems", level: "Med" },
    { name: "Surveying", level: "High" },
    { name: "Blogging", level: "Med" }
  ];

  return (
    <div className="glass-panel rounded-3xl border border-slate-700 shadow-2xl overflow-hidden group">
      {/* Cover Image */}
      <div className="h-24 bg-gradient-to-r from-cyan-900 to-slate-900 relative">
         <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500 via-transparent to-transparent"></div>
      </div>

      <div className="px-6 pb-6 -mt-12 relative">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-2xl bg-slate-800 border-4 border-slate-900 shadow-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900"></div>
          <span className="text-3xl font-black text-slate-500 relative z-10 group-hover:text-cyan-400 transition-colors">RS</span>
        </div>

        {/* Identity */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-1">Rahul Shyam</h3>
          <p className="text-cyan-400 text-sm font-medium mb-1">Civil Engineering Student</p>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
             <MapPin className="w-3 h-3" /> Chennai, India
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mb-8">
            <a 
              href="https://www.linkedin.com/in/rahulshyamcivil/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-medium text-sm shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5"
            >
              <Linkedin className="w-4 h-4" /> Connect on LinkedIn
            </a>
            <div className="grid grid-cols-2 gap-2">
                <a 
                  href="mailto:rahulcvfiitjee@gmail.com"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition-all"
                >
                  <Mail className="w-3 h-3" /> Email
                </a>
                <a 
                  href="https://drive.google.com/file/d/11BXxzDZneovwL4tFqS0xxujDtX87W1JI/view?usp=sharing" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition-all"
                >
                  <Download className="w-3 h-3" /> CV
                </a>
            </div>
        </div>

        {/* Skills Mini-Cloud */}
        <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Core Competencies</h4>
            <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                    <span key={s.name} className="px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors cursor-default">
                        {s.name}
                    </span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
