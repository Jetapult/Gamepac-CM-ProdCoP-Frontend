import React, { useState } from 'react';
import axios from 'axios';
import downloadImg from '../assets/download-button-svgrepo-com.svg';

const ImagePipeline = () => {
    const [keywordMain, setKeywordMain] = useState('');
    const [prompts, setPrompts] = useState(['']); // Step 1: Initialize prompts with a single empty
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imagesBase64, setImagesBase64] = useState([]); // Step 1: Add state for base64 images

    const handleFileChange = (event) => {
        setFile(event.target.files[0]); // Only take the first file
    };

    const handleKeywordChange = (event) => {
        setKeywordMain(event.target.value);
    };

    // Step 3: Handle change in prompt inputs
    const handlePromptChange = (index, event) => {
        const newPrompts = [...prompts];
        newPrompts[index] = event.target.value;
        setPrompts(newPrompts);
    };
    // Step 2: Add a new prompt input field
    const addPrompt = () => {
        setPrompts([...prompts, '']);
    };
     // Method to delete a prompt
     const deletePrompt = (index) => {
         const newPrompts = prompts.filter((_, i) => i !== index);
         setPrompts(newPrompts);
     };
    // const handleColorVariationsChange = (event) => {
    //     const colors = event.target.value.split(',').map(color => color.trim()); // Assuming colors are comma-separated
    //     setColorVariations(colors);
    // };

    const generateContent = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('keyword_main', keywordMain);
        prompts.forEach(prompt => formData.append('prompts[]', prompt));
        // colorVariations.forEach(color => formData.append('color_variations[]', color));
        console.log(formData);
        try {
            const result = await axios.post('https://papi.gamepacai.com/process-image', formData);
            console.log(result.data);
            setImagesBase64(result.data); // Step 2: Set the base64 images
            setLoading(false);
            setSuccess(true);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center pt-10">
            <div className="bg-white p-8 rounded-md shadow-md max-w-2xl mx-auto">
                <h2 className="text-2xl text-center font-bold mb-4">Generate Assets</h2>
                <div className="mb-4">
                    <label htmlFor="imageInput" className="block text-sm font-medium text-gray-800">Image File</label>
                    <input type="file" id="imageInput" accept="image/*" onChange={handleFileChange} className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"></input>
                </div>
                <div className="mb-4">
                    <label htmlFor="keywordInput" className="block text-sm font-medium text-gray-800">Main Keyword</label>
                    <input type="text" id="keywordInput" placeholder="Enter main keyword" onChange={handleKeywordChange} className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"></input>
                </div>
                {prompts.map((prompt, index) => (
                    <div key={index} className="mb-4 flex items-center">
                        <input type="text" id={`promptInput-${index}`} value={prompt} placeholder="Enter Prompt" onChange={(e) => handlePromptChange(index, e)} className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"/>
                        <button onClick={() => deletePrompt(index)} className="ml-2 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none">-</button>
                    </div>
                ))}
                <button onClick={addPrompt} className="mb-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none">+</button>
                <button onClick={generateContent} className="w-full bg-[#f58174] text-white py-2 px-4 rounded-md hover:bg-[#eaa399] focus:outline-none focus:ring focus:border-gray-400">{loading ? 'Loading...' : 'Generate Content'}</button>
                {success && (
                    <>
                        <div className="text-green-500 mt-4">Content generated successfully!</div>
                        {/* Step 3: Render the images */}
                        {console.log}
                        {imagesBase64.map((imageBase64, index) => (
                            <div key={index} className="relative  mt-4 inline-block">
                            <img key={index} src={`data:image/png;base64,${imageBase64}`} alt="Generated Content" className="block" />
                            <a href={`data:image/png;base64,${imageBase64}`} download={`image-${index}.png`}  className="absolute bottom-0 right-0 mb-1 mr-1 bg-red-400 p-1 hover:bg-red-100 focus:outline-none">
                                <img src={downloadImg} alt="Download" className="h-4 w-4" />
                            </a>
                            </div>
                        ))}
                    </>
                )}          
             </div>
        </div>
    );
};

export default ImagePipeline;