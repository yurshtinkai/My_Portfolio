import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from './App';

export default function TechStackPage() {
  // Call useDarkMode to ensure the html element's dark class is synced if they refresh on this page
  useDarkMode();

  const techCategories = [
    {
      name: "Frontend",
      items: [
        { name: "HTML", icon: <i className="fab fa-html5 text-orange-500 text-sm"></i> },
        { name: "CSS", icon: <i className="fab fa-css3-alt text-blue-500 text-sm"></i> },
        { name: "JavaScript", icon: <i className="fab fa-js text-yellow-400 text-sm"></i> },
        { name: "TypeScript", icon: <span className="text-blue-500 font-bold bg-blue-100 dark:bg-blue-900/50 px-1 rounded-sm text-[9px]">TS</span> },
        { name: "React", icon: <i className="fab fa-react text-sky-400 text-sm"></i> },
        { name: "Next.js", icon: <i className="fab fa-neos text-black dark:text-white text-sm"></i> },
        { name: "Tailwind CSS", icon: <i className="fas fa-wind text-cyan-400 text-sm"></i> },
        { name: "Vite", icon: <i className="fas fa-bolt text-purple-500 text-sm"></i> }
      ]
    },
    {
      name: "Backend",
      items: [
        { name: "Node.js", icon: <i className="fab fa-node-js text-green-500 text-sm"></i> },
        { name: "Express.js", icon: <i className="fas fa-server text-slate-500 text-sm"></i> },
        { name: "Laravel", icon: <i className="fab fa-laravel text-red-500 text-sm"></i> },
        { name: "sequelize", icon: <i className="fas fa-database text-blue-400 text-sm"></i> },
        { name: "REST API", icon: <i className="fas fa-exchange-alt text-green-600 text-sm"></i> },
        { name: "Firebase", icon: <i className="fas fa-fire text-yellow-500 text-sm"></i> },
        { name: "JWT", icon: <i className="fas fa-key text-yellow-600 text-sm"></i> },
        { name: ".NET", icon: <i className="fas fa-code text-indigo-500 text-sm"></i> },
        { name: "ASP.NET Core", icon: <i className="fas fa-code text-indigo-500 text-sm"></i> }
      ]
    },
    {
      name: "Database",
      items: [
        { name: "MySQL", icon: <i className="fas fa-database text-blue-400 text-sm"></i> },
        { name: "MS SQL", icon: <i className="fas fa-database text-red-400 text-sm"></i> }
      ]
    },
    {
      name: "Programming Languages",
      items: [
        { name: "C", icon: <i className="fas fa-code text-blue-600 text-sm"></i> },
        { name: "C++", icon: <i className="fas fa-file-code text-blue-700 text-sm"></i> },
        { name: "C#", icon: <i className="fas fa-hashtag text-purple-500 text-sm"></i> }
      ]
    },
    {
      name: "Tools & DevOps",
      items: [
        { name: "Git", icon: <i className="fab fa-git-alt text-orange-600 text-sm"></i> },
        { name: "Github", icon: <i className="fab fa-github text-black dark:text-white text-sm"></i> },
        { name: "Postman", icon: <i className="fas fa-space-shuttle text-orange-500 text-sm"></i> },
        { name: "Vercel", icon: <i className="fas fa-caret-up text-black dark:text-white text-sm"></i> },
        { name: "Render", icon: <i className="fas fa-cloud text-cyan-600 text-sm"></i> },
        { name: "VS Code", icon: <i className="fas fa-code text-blue-500 text-sm"></i> },
        { name: "Visual Studio", icon: <i className="fas fa-code text-purple-600 text-sm"></i> }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-300 relative">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-6 pt-6 pb-16 md:pt-7 md:pb-24">
        <div className="relative flex flex-col md:flex-row md:items-center justify-center mb-10 pb-5 border-b border-slate-200 dark:border-[#333]">

          <Link to="/" className="md:absolute left-0 mb-4 md:mb-0 text-slate-600 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Home
          </Link>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">Tech Stack</h1>

        </div>

        <div className="space-y-12 pl-4 md:pl-0">
          {techCategories.map((cat, idx) => (
            <section key={idx}>
              <h2 className="text-[17px] md:text-lg font-bold mb-4">{cat.name}</h2>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {cat.items.map((tech, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black text-[13px] font-medium text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#333] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default">
                    {tech.icon} {tech.name}
                  </span>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
