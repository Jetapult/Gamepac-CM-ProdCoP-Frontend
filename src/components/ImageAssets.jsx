import React, { useState, useEffect} from 'react';
import api from '../api';

const ImageAssets = ()=>{
    const [prompt,setPrompt]=useState('');
    const [files,setFiles]=useState(null);
    const [loading,setLoading]=useState(false);
    const [success,setSuccess]=useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]); 
    useEffect(() => {
        setGeneratedText('');
        setSuccess(false);
    }, [prompt, files]);
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles(selectedFiles);
        setImagePreviewUrls(selectedFiles.map(file => URL.createObjectURL(file)));
    };

    const handlePromptChange=(event)=>{
        const selectedPrompt=event.target.value;
        setPrompt(selectedPrompt);
    }

    const generateContent=async()=>{
        setLoading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('files', file)); 
        formData.append('prompt', prompt);

        try {
            const result = await api.post('/generateData', formData );
            console.log(result.data.generatedText);
            setGeneratedText(result.data.generatedText);
            setLoading(false);
            setSuccess(true);
            // Handle the result as needed
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    }

    return (
        <div className="flex justify-center pt-10">
            <div className="bg-white p-8 rounded-md shadow-md max-w-2xl mx-auto">
                <h2 className="text-2xl text-center font-bold mb-4">Talk to Images!</h2>
                <div className="mb-4">
                    <label htmlFor="imageInput" className="block text-sm font-medium text-gray-800">Image File (jpg,jpeg,webp,heic,png)</label>
                    <input type="file" id="imageInput" accept="image/*" onChange={handleFileChange} multiple className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"></input>
                </div>
                {imagePreviewUrls.map((url, i) => <img key={i} src={url} alt="Preview" className="mb-4"/>)}
                <div className="mb-4">
                    <label htmlFor="promptInput" className="block text-sm font-medium text-gray-800">Prompt</label>
                    <textarea id="promptInput" placeholder="Enter prompt" onChange={handlePromptChange} className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"></textarea>
                </div>
                <button onClick={() => generateContent()} className="w-full bg-[#f58174] text-white py-2 px-4 rounded-md hover:bg-[#eaa399] focus:outline-none focus:ring focus:border-gray-400">{loading ? 'Loading...' : 'Generate Content'}</button>
                {success && <div className="text-green-500">Content generated successfully!</div>}
                {generatedText && <ul className="mt-4 p-4 bg-gray-100 rounded-md">{generatedText.split('\n').map((item, i) => {
                    if (item.trim() !== '') {
                        const boldText = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return <li key={i} dangerouslySetInnerHTML={{ __html: '&#8226; ' + boldText }}></li>
                    } else {
                        return <li key={i}></li>
                    }
                })}</ul>}
            </div>
        </div>
    )
}

export default ImageAssets;