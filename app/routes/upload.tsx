import FileUploader from 'components/FileUploader';
import Navbar from 'components/Navbar'
import { prepareInstructions } from 'constans';
import { hasSubscribers } from 'diagnostics_channel';
import { convertPdfToImage } from 'lib/PdfToImage';
import { usePuterStore } from 'lib/puter';
import { generateUUID } from 'lib/utils';
import React, { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router';

const upload = () => {
    const {auth,isLoading,fs,ai,kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing,setIsProcessing] = useState(false);
    const [statusText,setStatusText] = useState('')
    const [file,setFile] =useState<File | null>(null);
    const handleFilesSelect = (file:File|null) =>{
        setFile(file)
    }


    const handleAnalyze = async ({companyName,jopTitle,jopDescription,file}:{companyName:String,jopTitle:String,jopDescription:String,file:File})=>{
        setIsProcessing(true);
        setStatusText('Uploading the file...');
        const uploadedFile = await fs.upload([false]);
        if(!uploadedFile) return setStatusText('Error Failed to Upload file');
        setStatusText('converting ro image...');
        const imageFile = await convertPdfToImage(false);
        if(!imageFile.file) return setStatusText ('Error to convert pdf to image..');
        setStatusText('uploading the image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage) return setStatusText ('Error : Failed to upload image');
        setStatusText("preparing data...");
        const uuid = generateUUID();
        const data ={
            id:uuid,
            resumePath:uploadedFile.path,
            imagePath:uploadedImage.path,
            companyName,jopTitle,jopDescription,
            feedback:'',
        }
        await kv.set(`resume : ${uuid}`, JSON.stringify(data));
        setStatusText('Analyzing....');
        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jopTitle,jobDescription})
        )
        if(!feedback) return setStatusText('Error : Failed to analyze resume');
        const feedbackText = typeof feedback.message.content === 'string'
        ? feedback.message.content
        : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume : ${uuid}`, JSON.stringify(data));
        setStatusText('Analyzes complete , redirecting');
        navigate(`/resume/${uuid}`);
    }

   const handleSubmit = (e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if(!form) return;
    const fromData = new FormData(form);
    const companyName = fromData.get('company-name') as string;
    const jopTitle = fromData.get('jop-title') as string;
    const jopDescription = fromData.get('jop-description')as string;
handleAnalyze({companyName,jopTitle,jopDescription,file});

   }
  return (
    <main className="bd-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
    <section className="main-section">
        <div className='page-heading py-16'>
            <h1>Smart feedback for your dream jop</h1>
            {isProcessing ? (
                <>
                <h2>{statusText}</h2>
                <img src="/images/resume-scan.gif" alt=""  className='w-full'/>
                </>
            ):(
                <h2>drop your resume for an ATS score and imporvment tips</h2>
            )}
            {!isProcessing &&(
                <form action=""  onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <div className='form-div'>
                        <label htmlFor="company-name"> Company Name</label>
                        <input type="text" name='company-name' placeholder='company-name'/>
                        </div>
                        <div className='form-div'>
                        <label htmlFor="jop-title"> Jop Title</label>    
                        <input type="text" name='jop-title' placeholder='jop-title'/>
                        </div>
                        <div className='form-div'>
                        <label htmlFor="jop-description"> Jop Description</label>
                        <textarea rows={5} name='jop-description' placeholder='jop-description'/>
                        </div>
                        <div className='form-div'>
                        <label htmlFor="uploader"> Upload Resume</label>
                        <FileUploader onFileSlect={handleFilesSelect}/>
                        </div>
                        <button className='primary-button' type='submit'>
                            Analyze Resume
                        </button>
                </form>
            )}
        </div>
    </section>
   </main>
  )
}

export default upload