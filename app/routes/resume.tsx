import Ats from 'components/Ats'
import Details from 'components/Details'
import Summary from 'components/Summary'
import { usePuterStore } from 'lib/puter'
import  { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
export const meta = ()=>([
    {title:"Resumnizer | Review"},
    {name: 'description' , content:'Detailed overview of your resume '}
])

const resume = () => {
    const[imageUrl,setImageUrl] = useState('');
    const[resumeUrl,setResumeUrl] = useState('');
    const[feedback,setfeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();
     const {auth,isLoading,fs,kv} = usePuterStore();
       useEffect(()=>{
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume:${id}`);
         },[isLoading])

   

    const {id} = useParams();
    useEffect(()=>{
        const loadResume = async () =>{
            const resume = await kv.get(`resume: ${id}`);
            if(!resume) return ;
            const data = JSON.parse(resume);
            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;
            const pdfBlob = new Blob([resumeBlob],{type:'application/pdf'});
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl)
            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob)return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);
            setfeedback(data.feedback);
        }
        loadResume();
    },[id]);

  return (
    <main className='!pt-0 '>
        <nav className='resume-nav'>
            <Link to="/" className='back-button'>
            <img src="/icons/back.svg" alt="logo" className='w-2.5 h-2.5' />
            <span className='text-gray-100 text-sm font-semibold'>Back to homePage</span>
            </Link>
        </nav>
        <div className='flex flex-row w-full max-lg:flex-col-reverse'>
            <section className="feedback-section  bg-[url('/images/bg-small.svg') bg-cover justify-center items-center">
                {imageUrl && resumeUrl &&(
                <div className='animation-in fade-in duration-1000 gradient- max-sm:m-0 h[90%] max-w-xl:h-fit w-fit'>
                    <a href={resumeUrl} target='_blank' rel='noonpener noreferrer'>
                        <img src={imageUrl} alt="resume" className='w-full h-full rounded-2xl' title='resume' />
                    </a>
                </div>
                )}

            </section>
            <section className='feedback-section'>
                <h2 className='text-4xl !text-black font-bold'>Resume Review</h2>
                {feedback ?(
                    <div className='flex flex-col gap-8 animation-in fade-in duration-1000'>
                    <Summary feedback={feedback}/>
                    <Ats score={feedback.ATS.score || 0} suggesyions = {feedback.ATS.tips || []}/>
                    <Details feedback={feedback}/>
                    </div>
                ):(
                    <img src="/images/resume-scan-2.gif" alt="" />
                )}
            </section>
        </div>
    </main>
  )
}

export default resume