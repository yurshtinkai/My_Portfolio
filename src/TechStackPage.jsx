import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from './App';

export default function TechStackPage() {
  // Call useDarkMode to ensure the html element's dark class is synced if they refresh on this page
  useDarkMode();

  const techCategories = [
    {
      name: "Frontend",
      items: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Vite"]
    },
    {
      name: "Backend",
      items: ["Node.js", "Express.js", "Laravel", "sequelize", "REST API", "Firebase", "JWT", ".NET", "ASP.NET Core"]
    },
    {
      name: "Database",
      items: ["MySQL", "MS SQL"]
    },
    {
      name: "Programming Languages",
      items: ["C", "C++", "C#"]
    },
    {
      name: "Tools & DevOps",
      items: ["Git", "Github", "Postman", "Vercel", "Render", "VS Code", "Visual Studio"]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-6 md:p-12 font-sans transition-colors duration-300 relative pb-24">
      <div className="max-w-5xl mx-auto pt-4 md:pt-0.5">
        <div className="relative flex flex-col md:flex-row md:items-center justify-center mb-10 pb-5 border-b border-slate-200 dark:border-[#333]">

          <Link to="/" className="md:absolute left-0 mb-4 md:mb-0 text-slate-600 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Home
          </Link>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">Tech Stack</h1>

        </div>

        <div className="space-y-12">
          {techCategories.map((cat, idx) => (
            <section key={idx}>
              <h2 className="text-[17px] md:text-lg font-bold mb-4">{cat.name}</h2>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {cat.items.map((tech, i) => (
                  <span key={i} className="px-3 md:px-4 py-1.5 md:py-2 bg-white dark:bg-black text-[12px] md:text-[13px] font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#333] rounded-none shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] transition-all duration-300 cursor-default whitespace-nowrap">
                    {tech}
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
