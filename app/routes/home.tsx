import Navbar from "components/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "constans";
import ResumeCard from "components/ResumeCard";
import { useNavigate } from "react-router";
import { usePuterStore } from "lib/puter";
import { useEffect } from "react";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumnizer" },
    { name: "description", content: "Smart feedback for your dream jop" },
  ];
}

export default function Home() {
      const {auth} = usePuterStore();
    const navigate = useNavigate();
    useEffect(()=>{
        if(!auth.isAuthenticated) navigate("/auth?next=/");
         },[auth.isAuthenticated])
         
  return <main className="bd-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
    <section className="main-section">
      <div className="page-heading py-16">
        <h1 >Track Your Application & Resume Ratings</h1>
        <h2>Review your submissions and check AI-powerd feedback.</h2>
      </div>
    {resumes.length > 0 && (
      <div className="resume-section">
      {resumes.map((resume)=>(
      <ResumeCard key={resume.id} resume={resume}/>
    ))}
    </div>
    )}
 </section>
  </main>;
}
