import React, { useState } from 'react';
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2.img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const upload = () => {

    const {auth,isLoading,fs,ai,kv}=usePuterStore()
    const navigate=useNavigate()
    const  [isProcessing,setisProcessing]=useState(false)
    const [statusText,setStatusText]=useState('')
    const [file,setFile]=useState<File | null>(null)
    const handleFileSelect =(file:File|null) => {
     setFile(file)
    }
    const handleAnalyze=async ({companyName,jobTitle,jobDescription,file}:{companyName: string, jobTitle: string, jobDescription: string, file:File}) => {

        setisProcessing(true)
        setStatusText('uploading the file...')

        const uploadedFile = await fs.upload([file])
        if(!uploadedFile) return setStatusText('Error : file failes to upload')

        setStatusText(('converting to image ...'))
        const imageFile=await convertPdfToImage(file)
        if(!imageFile.file) return setStatusText('Error : failed to convert pdf to image ')

        setStatusText('uploading the image...')
        const uploadedimage=await fs.upload([imageFile.file])
        if(!uploadedimage) return setStatusText('Error : failed to upload image  ')

        setStatusText('preparing... data')
        const uuid=generateUUID()
        const data={
            id:uuid,
            resumePath:uploadedFile.path,
            imagePath:uploadedimage.path,
            companyName,jobTitle,jobDescription,
            feedback:'',
        }
           await kv.set(`resume:${uuid}`,JSON.stringify(data))
        setStatusText('Analyzing')
        const feedback=await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jobTitle,jobDescription})
        )
         if(!feedback) return setStatusText('Error : failed to analyze resume')

        const feedbackText=typeof feedback.message.content==='string'
        ? feedback.message.content:
            feedback.message.content[0].text

        data.feedback =JSON.parse(data.feedback)
        await kv.set(`resume:${uuid}`,JSON.stringify(data))
        setStatusText('analyzing complete ,redirecting...')
        navigate(`/resume/${uuid}`)

    }

    const handlesubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form =e.currentTarget.closest('form');
        if(!form)return
        const fromData=new FormData(form)
        const companyName =fromData.get('company-name')as string
        const jobTitle =fromData.get('job-title')as string
        const jobDescription =fromData.get('job-description')as string

        if(!file) return
        handleAnalyze({companyName,jobTitle,jobDescription,file})
    };
  return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
          <Navbar/>

          <section className="main-section">
              <div className="page-heading py-16 ">
                  <h1>Smart feedback for your current job</h1>
                  {isProcessing ? (
                      <>
                          <h2>{statusText}</h2>
                          <img src="/images/resume-scan.gif" className="w-full"/>
                      </>
                  ):(
                     <h2> Drop your resume for ats for score and resume tips
                     </h2>
                  )}
                  {!isProcessing && ( <form id="upload-form" onSubmit={handlesubmit} className="flex flex-col gap-4  mt-8">
                          <div className="form-div">
                              <label htmlFor="company-name">Company Name</label>
                              <input type="text"  name="company-name" placeholder="company-name" id="company-name" />
                          </div>
                          <div className="form-div">
                              <label htmlFor="job-title"> job-title</label>
                              <input type="text"  name="job-title" placeholder="job-title" id="job-title" />
                          </div>
                          <div className="form-div">
                              <label htmlFor="job-description"> job-description</label>
                              <textarea rows={5}  name="job-description" placeholder="job-title" id="job-description" />
                          </div>
                          <div className="form-div">
                              <label htmlFor="uploader"> upload-resume</label>
                              <FileUploader onFileSelect={handleFileSelect}/>
                          </div>
                          <button className="primary-button" type="submit">
                              analyze resume
                          </button>
                  </form>
                  )}

              </div>
          </section>
      </main>
  );
};

export default upload;