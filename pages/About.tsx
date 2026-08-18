
import React, { useState } from 'react';
import AboutHero from '../components/AboutHero';
import ContactCard from '../components/ContactCard';
import { 
  Code, 
  Briefcase, 
  GraduationCap, 
  Cpu, 
  Globe, 
  Layers, 
  Award, 
  ExternalLink, 
  MapPin,
  Download
} from 'lucide-react';

type Tab = 'overview' | 'portfolio' | 'resume';

const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Globe className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Projects', icon: <Cpu className="w-4 h-4" /> },
    { id: 'resume', label: 'Timeline', icon: <Briefcase className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[#0f172a]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.1]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      </div>

      <AboutHero />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        {/* Left Sidebar: Identity & Contact */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-24 space-y-6">
            <ContactCard />
            
            {/* Status Widget */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current Status</h4>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <div>
                  <div className="text-sm text-white font-medium">Open to Internships</div>
                  <div className="text-xs text-slate-400">Site Engineering / Civil Tech</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex p-1 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 w-full sm:w-fit overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/10 text-cyan-400 shadow-sm border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px] animate-[fadeIn_0.3s_ease-out]">
            
            {/* ================= OVERVIEW TAB ================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Bio Card */}
                <div className="glass-panel p-8 rounded-3xl border border-slate-700/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-bl-full pointer-events-none"></div>
                  
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                    Bridging Concrete & Code
                  </h2>
                  
                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4">
                    <p>
                      I am <strong className="text-white">Rahul Shyam</strong>, a second-year Civil Engineering student at Erode Sengunthar Engineering College with a distinctive edge: I don't just understand structures; I build the digital tools to analyze them.
                    </p>
                    <p>
                      My journey is fueled by curiosity—from the physics of why bridges stand to the logic of how software scales. I am actively developing skills in <span className="text-cyan-300">Project Management</span>, <span className="text-cyan-300">IoT Systems</span>, and <span className="text-cyan-300">Web Technologies</span> to modernize how we approach infrastructure.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                       <div className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                          <Award className="w-3 h-3 text-amber-400" /> Math Olympiad Medalist
                       </div>
                       <div className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                          <Award className="w-3 h-3 text-purple-400" /> Science Expo Achiever
                       </div>
                       <div className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                          <Award className="w-3 h-3 text-emerald-400" /> Competitive Chess Player
                       </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Projects', value: '6+', sub: 'Completed', icon: Code },
                    { label: 'Education', value: '2nd', sub: 'Year B.E.', icon: GraduationCap },
                    { label: 'Focus', value: 'Civil', sub: 'Engineering', icon: Layers },
                    { label: 'Location', value: 'India', sub: 'Chennai', icon: MapPin },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl hover:bg-slate-800/60 transition-colors">
                      <stat.icon className="w-5 h-5 text-cyan-500 mb-3 opacity-80" />
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-xs text-slate-500 uppercase font-bold">{stat.label}</div>
                      <div className="text-[10px] text-slate-600">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= PORTFOLIO TAB ================= */}
            {activeTab === 'portfolio' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-white font-bold text-lg">Engineering Portfolio</h3>
                        <p className="text-slate-400 text-sm">A showcase of technical and civil engineering projects.</p>
                    </div>
                    <a 
                        href="https://github.com/rahulcvwebsitehosting" 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                    >
                        <Code className="w-4 h-4" /> View GitHub
                    </a>
                </div>

                {/* Mixolab (Previously Mixologist) */}
                <div className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-900/10">
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-6 md:p-8 grid md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">Mixolab</h3>
                           <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase border border-cyan-500/20">Web App</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                           An interactive web application teaching concrete proportioning per Indian Standards (IS Codes). It simplifies complex mix design calculations into an intuitive interface, currently helping <span className="text-white font-medium">3,000+ monthly users</span> learn and apply civil engineering standards.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                           {['React', 'Tailwind', 'Civil Eng', 'Education'].map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400">{tag}</span>
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6">
                        <div className="text-xs text-slate-500 font-mono mb-1">DATE</div>
                        <div className="text-sm text-white font-bold mb-4">Aug 2025</div>
                        <a 
                          href="https://mixolab.blogspot.com/" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs flex items-center gap-1 text-cyan-400 hover:underline"
                        >
                           View Project <ExternalLink className="w-3 h-3" />
                        </a>
                     </div>
                  </div>
                </div>

                {/* Greenify Event Maestro (NEW) */}
                <div className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-900/10">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-6 md:p-8 grid md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">Greenify Event Maestro</h3>
                           <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/20">AI Tool</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                           Greenify Event Maestro is a smart tool that helps you plan events in a sustainable, eco-friendly, and efficient way. It calculates supplies, reduces waste, gives zero-waste plans, analyzes crowd size using AI, and guides you to make environmentally responsible decisions—all with precision and simplicity.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                           {['AI Analysis', 'Sustainability', 'Event Planning', 'Zero Waste'].map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400">{tag}</span>
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6">
                        <div className="text-xs text-slate-500 font-mono mb-1">STATUS</div>
                        <div className="text-sm text-emerald-400 font-bold mb-4">Live</div>
                        <a 
                          href="https://aiplannercv.netlify.app/" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs flex items-center gap-1 text-emerald-400 hover:underline"
                        >
                           View Project <ExternalLink className="w-3 h-3" />
                        </a>
                     </div>
                  </div>
                </div>

                {/* Civil Spot Finder */}
                <div className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-900/10">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-6 md:p-8 grid md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">Civil Spot Finder</h3>
                           <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase border border-purple-500/20">Integration</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                           A resource mapping tool that integrates with Google Maps API to plot over <span className="text-white font-medium">120 construction sites</span> and infrastructure landmarks. Designed to help students find internship opportunities and site visits near them.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                           {['Google Maps API', 'Geolocation', 'Data Viz'].map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400">{tag}</span>
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6">
                        <div className="text-xs text-slate-500 font-mono mb-1">DATE</div>
                        <div className="text-sm text-white font-bold mb-4">Aug-Sep 2025</div>
                        <a 
                          href="http://civilspotfinder.blogspot.com/" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs flex items-center gap-1 text-purple-400 hover:underline"
                        >
                           View Project <ExternalLink className="w-3 h-3" />
                        </a>
                     </div>
                  </div>
                </div>

                {/* Smart Bathroom Flush System (IoT) */}
                <div className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-900/10">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-6 md:p-8 grid md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">Smart Bathroom Flush System</h3>
                           <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase border border-amber-500/20">IoT Hardware</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                           An automated hygiene system using Arduino and NodeMCU microcontrollers. Features IR sensors for presence detection and servo-controlled door mechanisms to ensure sanitation and accessibility.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                           {['Arduino', 'C++', 'Sensors', 'Automation'].map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400">{tag}</span>
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6">
                        <div className="text-xs text-slate-500 font-mono mb-1">STATUS</div>
                        <div className="text-sm text-amber-400 font-bold mb-4">Ongoing</div>
                     </div>
                  </div>
                </div>

                {/* Stair Cleaning Robot */}
                <div className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-rose-500/30 transition-all hover:shadow-xl hover:shadow-rose-900/10">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-6 md:p-8 grid md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">Stair Cleaning Robot</h3>
                           <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase border border-rose-500/20">Robotics</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                           An autonomous cleaning robot designed to navigate staircases using IR/ultrasonic sensors and a stable wheel-track mechanism. Features rotating brushes and suction modules to remove dust while preventing falls, ensuring efficient and safe stair maintenance.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                           {['Arduino', 'Sensors', 'Robotics', 'Automation'].map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400">{tag}</span>
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6">
                        <div className="text-xs text-slate-500 font-mono mb-1">STATUS</div>
                        <div className="text-sm text-rose-400 font-bold mb-4">Ongoing</div>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= RESUME TAB ================= */}
            {activeTab === 'resume' && (
              <div className="space-y-8">
                 {/* Header */}
                 <div className="flex items-center justify-between bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                    <div>
                        <h3 className="text-white font-bold text-lg">Professional Timeline</h3>
                        <p className="text-slate-400 text-sm">Education history and certifications.</p>
                    </div>
                    <a 
                       href="https://drive.google.com/file/d/11BXxzDZneovwL4tFqS0xxujDtX87W1JI/view?usp=sharing" 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-cyan-900/20"
                    >
                       <Download className="w-4 h-4" /> Download PDF
                    </a>
                 </div>

                 <div className="relative space-y-8 pl-6 md:pl-0">
                    {/* Vertical Line */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-slate-800 hidden md:block"></div>

                    {/* Education Node */}
                    <div className="relative md:flex items-center justify-between group">
                       <div className="hidden md:block w-5/12 text-right pr-8">
                          <div className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">Bachelor of Engineering</div>
                          <div className="text-slate-400">Civil Engineering</div>
                          <p className="text-slate-500 text-xs mt-2">CGPA: 8.5 (Current)</p>
                       </div>
                       
                       <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border-4 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] z-10"></div>
                       
                       <div className="md:w-5/12 pl-8 md:pl-8">
                          <div className="md:hidden text-xl font-bold text-white mb-1">Bachelor of Engineering</div>
                          <div className="md:hidden text-slate-400 mb-2">Civil Engineering</div>
                          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 group-hover:border-cyan-500/30 transition-colors">
                             <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <GraduationCap className="w-3 h-3" /> 2024 - 2028
                             </div>
                             <div className="font-medium text-slate-200">Erode Sengunthar Engineering College</div>
                             <div className="text-xs text-slate-500 mt-1">2nd Year Student</div>
                          </div>
                       </div>
                    </div>

                    {/* High School Node */}
                    <div className="relative md:flex items-center justify-between group">
                       <div className="hidden md:block w-5/12 text-right pr-8">
                          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 group-hover:border-purple-500/30 transition-colors inline-block w-full text-right">
                             <div className="flex items-center justify-end gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <GraduationCap className="w-3 h-3" /> Completed
                             </div>
                             <div className="font-medium text-slate-200">Jain Public School</div>
                             <div className="text-xs text-slate-500 mt-1">Higher Secondary Education</div>
                          </div>
                       </div>
                       
                       <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-500 z-10"></div>
                       
                       <div className="md:w-5/12 pl-8 md:pl-8">
                          <div className="md:hidden mb-4">
                             <div className="text-lg font-bold text-white">Higher Secondary</div>
                             <div className="text-slate-400 text-sm">Jain Public School</div>
                          </div>
                          <div className="hidden md:block text-xl font-bold text-white group-hover:text-purple-400 transition-colors">Higher Secondary</div>
                          <div className="hidden md:block text-slate-400">Schooling</div>
                       </div>
                    </div>

                    {/* Certification Node */}
                    <div className="relative md:flex items-center justify-between group">
                       <div className="hidden md:block w-5/12 text-right pr-8">
                           <div className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Ground Improvement</div>
                           <div className="text-slate-400">Technical Certification</div>
                       </div>
                       
                       <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-900 border-2 border-amber-500 z-10"></div>
                       
                       <div className="md:w-5/12 pl-8 md:pl-8">
                          <div className="md:hidden text-lg font-bold text-white mb-1">Ground Improvement</div>
                          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 group-hover:border-amber-500/30 transition-colors">
                             <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <Award className="w-3 h-3" /> Aug 2025 - Present
                             </div>
                             <div className="font-medium text-slate-200">NPTEL Course</div>
                             <div className="text-xs text-slate-500 mt-1">Geotechnical Engineering</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
