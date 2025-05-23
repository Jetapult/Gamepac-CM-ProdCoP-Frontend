import api from "../../../api";
import { useState } from "react";
import loadingIcon from "../../../assets/transparent-spinner.svg";

const UserInput = ({ user, setAds, setIsGameAnalyzed }) => {
  const [storeUrl, setStoreUrl] = useState("");
  const [submitLoader, setSubmitLoader] = useState(false);

  const handleCompetitorAnalysis = async () => {
    try {
      setSubmitLoader(true);
      // const competitorAnalysis = await api.get(
      //   `/v1/competitor-games/fetch-competitor-games`,
      //   {
      //     params: {
      //       store_link: storeUrl,
      //       studio_id: user?.studio_id,
      //     },
      //   }
      // );
      setIsGameAnalyzed(true);
      setSubmitLoader(false);
    } catch (error) {
      console.log(error);
      setSubmitLoader(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Ad Intelligence Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover top performing ads and optimize your creative strategy by
            analyzing competitors
          </p>

          <div className="w-full shadow-lg border border-1 border-gray-200 rounded-lg p-4 bg-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Get Started</h2>
              <p className="text-gray-600">
                Enter your app store link to see competitive ad intelligence
              </p>
            </div>
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  name="storeUrl"
                  placeholder="Paste App Store or Play Store URL"
                  className="flex-1 border border-1 border-gray-200 rounded-md p-2 focus:outline-[#b9ff66]"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  required
                />
                {submitLoader ? (
                  <button
                    className="bg-[#000] text-[#B9FF66] font-bold uppercase text-sm px-6 py-1.5 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 cursor-not-allowed"
                    type="button"
                  >
                    <img src={loadingIcon} alt="loading" className="w-8 h-8" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-8 bg-[#b9ff66] rounded-md p-2"
                    onClick={handleCompetitorAnalysis}
                  >
                    Analyze
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Example:
                https://play.google.com/store/apps/details?id=com.example.app
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="border border-1 border-gray-200 rounded-lg p-4 bg-white pb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Competitor Analysis</h2>
              </div>
              <div>
                <p className="text-gray-600">
                  Discover what ads your competitors are running and which ones
                  perform best
                </p>
              </div>
            </div>

            <div className="border border-1 border-gray-200 rounded-lg p-4 bg-white pb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Creative Insights</h2>
              </div>
              <div>
                <p className="text-gray-600">
                  Get detailed metrics on ad performance including CPI,
                  impressions, and watch time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserInput;
