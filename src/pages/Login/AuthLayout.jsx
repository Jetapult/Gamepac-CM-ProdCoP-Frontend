import sampleGamepacImage from "../../assets/super-agents/sample-bg.svg";
import accelLogo from "../../assets/super-agents/accel-logo.svg";
import strideVenturesLogo from "../../assets/super-agents/stride-ventures.svg";
import alteriaCapital from "../../assets/super-agents/alteria-capital.svg";
import FiresideventuresLogo from "../../assets/super-agents/fireside-ventures.svg";
import JetsyntesisLogo from "../../assets/super-agents/jetsynthesys-logo.svg";
import NuvamaLogo from "../../assets/super-agents/nuvama-logo.svg";
import ellipse from "../../assets/super-agents/ellipse.svg";
import gamepacLogo from "../../assets/super-agents/gamepac-logo.svg";
import LoginGif from "../../components/LoginGif";

const backedby = [
  {
    id: "1",
    logo: accelLogo,
    name: "Accel",
    url: "https://www.accel.com",
  },
  {
    id: "2",
    logo: FiresideventuresLogo,
    name: "Fireside Ventures",
    url: "https://www.firesideventures.com",
  },
  {
    id: "3",
    logo: JetsyntesisLogo,
    name: "Jetsynthesys",
    url: "https://www.jetsynthesys.com",
  },
  {
    id: "4",
    logo: strideVenturesLogo,
    name: "Stride Ventures",
    url: "https://www.strideventures.com",
  },
  {
    id: "5",
    logo: NuvamaLogo,
    name: "Nuvama",
    url: "https://www.nuvama.com",
  },
  {
    id: "6",
    logo: alteriaCapital,
    name: "Alteria Capital",
    url: "https://www.alteriacapital.com",
  },
];

const AuthLayout = ({ children }) => {
  return (
    <div className="grid grid-cols-2 h-screen font-urbanist">
      {/* Left Panel */}
      <div
        className="row-span-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(191deg, rgba(87, 248, 170, 0.60) 3.44%, rgba(51, 146, 100, 0.10) 68.2%)",
        }}
      >
        <LoginGif />
        <div className="absolute -bottom-[200px] -left-[150px] w-[900px] h-[500px] flex items-center justify-center">
          <img
            src={ellipse}
            alt="ellipse"
            className="w-full h-full object-contain"
          />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            style={{ paddingLeft: "150px", paddingBottom: "100px" }}
          >
            <p className="text-[#1B1B1B] text-sm font-medium mb-4">
              We are backed by
            </p>
            <div className="grid grid-cols-3 gap-4">
              {backedby.map((item) => (
                <img
                  src={item.logo}
                  alt={item.name}
                  className="h-[38px] w-auto"
                  key={item.id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="row-span-6 flex flex-col items-center justify-start bg-[url('/src/assets/super-agents/background-lines.svg')] bg-no-repeat bg-cover bg-center pt-[150px]">
        <div className="w-[400px]">
          <img
            src={gamepacLogo}
            alt="gamepac-logo"
            className="w-auto h-[50px] object-contain mb-8"
          />
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
