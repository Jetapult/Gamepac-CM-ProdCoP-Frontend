import { useReactMediaRecorder } from "react-media-recorder";
import micImg from "../assets/podcast-6781921-5588632.png";
const RecordView = () => {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true });

  return (
    <div className="border rounded-lg p-8 shadow-md mx-auto">
      <div className="flex flex-col items-center gap-4">
        <img
          src={micImg}
          alt="Microphone Icon"
          className="h-24 text-gray-600"
        />
        <div className="flex items-center gap-4">
          <button
            className="bg-[#eaa399] hover:bg-[#f1efe7]  hover:text-black text-white px-4 py-2 rounded transition-transform hover:scale-105"
            onClick={startRecording}
          >
            Start Recording
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-transform hover:scale-105"
            onClick={stopRecording}
          >
            Stop Recording
          </button>
        </div>
        <audio src={mediaBlobUrl} controls autoPlay loop className="w-52" />
      </div>
    </div>
  );
};
export default RecordView;
