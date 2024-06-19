import HDDLogo from "../../assets/hdd-logo.webp";
import AIGame from "../../assets/game-icon.png";
import { useNavigate } from "react-router-dom";
const games = [
  {
    id: "1",
    name: "Home Design Dreams house games",
    image: HDDLogo,
    type: "match-3"
  },
  {
    id: "2",
    name: "Murder Mystery Detective",
    image: AIGame,
    type: "word-search-puzzle"
  },
  {
    id: "3",
    name: "Murder Mystery Detective Hidden Objects",
    image: AIGame,
    type: "hidden-objects"
  },
  {
    id: "4",
    name: "Murder Mystery Narration",
    image: AIGame,
    type: "narration"
  }
];
const HTML5Games = () => {
    const navigate = useNavigate();
    const gotoPlayableGames = (game) => {
        navigate(`/html5-games/${game.type}`);
    }
  return (
    <main className="flex flex-col min-h-[100dvh]">
      <section className="w-full py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[#092139] tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Discover Our Captivating HTML5 Playable Games
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Immerse yourself in our collection of engaging and visually
                stunning HTML5 games. Explore, play, and enjoy the ultimate
                gaming experience.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {games.map((game) => (
              <div
              key={game.id}
              className="bg-white shadow rounded-lg p-6 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden group"
              onClick={() => gotoPlayableGames(game)}
            >
              <img src={game.image} alt="game-logo" className="rounded-xl" />
              <h2 className="text-xl font-black mt-2">{game.name}</h2>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition duration-300 ease-in-out hover:bg-opacity-50">
                <button className="bg-[#ff1053] text-white px-4 py-2 rounded opacity-0 group-hover:opacity-100">
                  Play Now
                </button>
              </div>
            </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default HTML5Games;
