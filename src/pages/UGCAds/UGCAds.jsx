// import React, { useEffect, useRef, useState } from "react";
// import Draggable from "react-draggable";
// import { createFFmpeg } from "@ffmpeg/ffmpeg";

// const UGCAds = () => {
//   const [productVideo, setProductVideo] = useState(null);
//   const [userVideo, setUserVideo] = useState(null);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [loading, setLoading] = useState(false);
//   const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
//   const [productVideoUrl, setProductVideoUrl] = useState(null);
//   const [userVideoUrl, setUserVideoUrl] = useState(null);

//   const ffmpeg = useRef(
//     createFFmpeg({
//       log: true,
//       corePath: "https://unpkg.com/@ffmpeg/core@0.8.5/dist/ffmpeg-core.js",
//       crossOrigin: "anonymous",
//       mainName: "main",
//       threads: 1, // Let FFmpeg decide thread count
//       logger: ({ message }) => console.log(message),
//       progress: (p) => console.log("Progress:", p),
//     })
//   );

//   useEffect(() => {
//     const loadFFmpeg = async () => {
//       try {
//         await ffmpeg.current.load();
//         console.log("FFmpeg is ready!");
//         setFfmpegLoaded(true);
//       } catch (error) {
//         console.error("FFmpeg load error:", error);
//       }
//     };
//     loadFFmpeg();
//   }, []);

//   const handleVideoUpload = (event, setVideo) => {
//     const file = event.target.files[0];
//     if (file) {
//       setVideo(file);
//     }
//   };

//   const handleDrag = (e, data) => {
//     setPosition({ x: data.x, y: data.y });
//   };

//   const writeFileInChunks = async (file, filename) => {
//     try {
//       const buffer = await file.arrayBuffer();
//       const uint8Array = new Uint8Array(buffer);
//       ffmpeg.current.FS("writeFile", filename, uint8Array);
//       console.log(`Successfully wrote ${filename}`);
//     } catch (error) {
//       console.error(`Error writing ${filename}:`, error);
//       throw new Error(`Failed to process ${filename}`);
//     }
//   };

//   const handleDownload = async () => {
//     if (!productVideo || !userVideo || !ffmpegLoaded) {
//       alert("Please ensure both videos are uploaded and FFmpeg is loaded");
//       return;
//     }

//     try {
//       setLoading(true);
//       const ff = ffmpeg.current;

//       // Get exact preview dimensions
//       const previewContainer = document.querySelector(
//         ".video-preview-container"
//       );
//       const containerWidth = 1080; // Fixed width for better quality
//       const containerHeight = 1920; // Fixed height for 9:16 ratio

//       // Calculate scaling factors
//       const previewWidth = previewContainer?.offsetWidth || 320;
//       const previewHeight = previewContainer?.offsetHeight || 568;
//       const scaleX = containerWidth / previewWidth;
//       const scaleY = containerHeight / previewHeight;

//       // Scale the overlay position to match the output resolution
//       const adjustedX = Math.round(position.x * scaleX);
//       const adjustedY = Math.round(position.y * scaleY);

//       // Calculate overlay size (scaled up from preview)
//       const overlayWidth = Math.round(128 * scaleX); // Scale up from preview size
//       const overlayHeight = Math.round(128 * scaleY);

//       console.log("Processing videos with dimensions:", {
//         container: `${containerWidth}x${containerHeight}`,
//         overlay: `${overlayWidth}x${overlayHeight}`,
//         position: `${adjustedX}x${adjustedY}`,
//       });

//       // Write input files
//       await writeFileInChunks(productVideo, "product.mp4");
//       await writeFileInChunks(userVideo, "user.mp4");

//       // Process with high-quality settings
//       await ff.run(
//         // Input files with higher quality settings
//         "-i",
//         "product.mp4",
//         "-i",
//         "user.mp4",

//         // Complex filtergraph
//         "-filter_complex",
//         [
//           // Scale main video to 1080p maintaining aspect ratio
//           `[0:v]scale=${containerWidth}:${containerHeight}:force_original_aspect_ratio=decrease,` +
//             `pad=${containerWidth}:${containerHeight}:(ow-iw)/2:(oh-ih)/2[main];`,

//           // Scale overlay video with high quality
//           `[1:v]scale=${overlayWidth}:${overlayHeight}:force_original_aspect_ratio=decrease[overlay];`,

//           // Overlay with exact positioning
//           `[main][overlay]overlay=${adjustedX}:${adjustedY}:eof_action=pass[out]`,
//         ].join(""),

//         // Output mapping
//         "-map",
//         "[out]",
//         "-map",
//         "0:a?",

//         // High quality output settings
//         "-c:v",
//         "libx264",
//         "-preset",
//         "medium", // Better quality, slower encoding
//         "-crf",
//         "23", // High quality (lower value = higher quality, 18-23 is visually lossless)
//         "-profile:v",
//         "high",
//         "-pix_fmt",
//         "yuv420p",
//         "-movflags",
//         "+faststart",
//         "-r",
//         "30", // Force 30fps output
//         "-y",
//         "output.mp4"
//       );

//       // Read and create download
//       console.log("Creating download...");
//       const data = ff.FS("readFile", "output.mp4");
//       const blob = new Blob([data.buffer], { type: "video/mp4" });

//       // Clean up
//       ff.FS("unlink", "product.mp4");
//       ff.FS("unlink", "user.mp4");
//       ff.FS("unlink", "output.mp4");

//       // Create download
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "ugc-ad.mp4";
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);

//       setTimeout(() => URL.revokeObjectURL(url), 100);
//     } catch (error) {
//       console.error("Processing error:", error);
//       alert(`Error processing video: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (productVideo) {
//       const url = URL.createObjectURL(productVideo);
//       setProductVideoUrl(url);
//       return () => URL.revokeObjectURL(url);
//     }
//   }, [productVideo]);

//   useEffect(() => {
//     if (userVideo) {
//       const url = URL.createObjectURL(userVideo);
//       setUserVideoUrl(url);
//       return () => URL.revokeObjectURL(url);
//     }
//   }, [userVideo]);
//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold text-center">UGC Ads</h1>
//       <div className="mt-4 flex">
//         <div className="w-1/5 max-w-2xl">
//           <div className="">
//             <label className="text-sm font-bold block mb-2">
//               Product Video
//             </label>
//             <input
//               type="file"
//               accept="video/*"
//               onChange={(e) => handleVideoUpload(e, setProductVideo)}
//               className="w-full"
//             />
//           </div>
//           <div className="">
//             <label className="text-sm font-bold block mb-2">User Video</label>
//             <input
//               type="file"
//               accept="video/*"
//               onChange={(e) => handleVideoUpload(e, setUserVideo)}
//               className="w-full"
//             />
//           </div>
//           <button
//             onClick={handleDownload}
//             disabled={!productVideo || !userVideo || loading || !ffmpegLoaded}
//             className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
//           >
//             {loading ? "Processing..." : "Download Video"}
//           </button>
//         </div>
//         <div className="w-4/5 pl-4">
//           <h2 className="text-xl font-bold mb-4">Playground</h2>
//           {ffmpegLoaded ? (
//             <p className="text-green-600">FFmpeg loaded successfully!</p>
//           ) : (
//             <p className="text-yellow-600">Loading FFmpeg...</p>
//           )}
//           {/* <button
//             onClick={handleDownload}
//             disabled={!productVideo || !userVideo || loading || !ffmpegLoaded}
//             className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
//           >
//             {loading ? "Processing..." : "Download Video"}
//           </button> */}
//           {/* TikTok aspect ratio container (9:16) */}
//           <div className="relative w-[320px] h-[568px] bg-black">
//           {productVideoUrl && (
//               <video
//                 key={productVideoUrl}
//                 src={productVideoUrl}
//                 className="absolute inset-0 w-full h-full object-cover"
//                 autoPlay
//                 loop
//                 muted
//                 playsInline
//               />
//             )}
//             {userVideoUrl && (
//               <Draggable
//                 bounds="parent"
//                 position={position}
//                 onDrag={(e, data) => {
//                   const overlayWidth = 112;
//                   const overlayHeight = 176;
//                   const x = Math.max(0, Math.min(data.x, 320 - overlayWidth));
//                   const y = Math.max(0, Math.min(data.y, 568 - overlayHeight));
//                   setPosition({ x, y });
//                 }}
//                 defaultPosition={{ x: 200, y: 20 }}
//               >
//                 <div className="absolute cursor-move">
//                   <video
//                     key={userVideoUrl}
//                     src={userVideoUrl}
//                     className="w-28 h-44 object-cover"
//                     autoPlay
//                     loop
//                     muted
//                     playsInline
//                   />
//                 </div>
//               </Draggable>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UGCAds;
