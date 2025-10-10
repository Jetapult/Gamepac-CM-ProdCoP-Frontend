import React, { useState } from "react";
import { DashboardShell } from "./components/DashboardShell";
import { PromptInput } from "./components/PromptInput";
import { TopGamesModule } from "./components/modules/TopGamesModule";
import { TrendHeatmapModule } from "./components/modules/TrendHeatMapModule";
import { GameTeardownModule } from "./components/modules/GameTearDownModule";
import { BenchmarkModule } from "./components/modules/BenchmarkModule";

const NewGameMarketIntelligence = () => {
  const [isLoadData, setIsLoadData] = useState(false);
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <PromptInput setIsLoadData={setIsLoadData} />
        {isLoadData && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TopGamesModule />
            <TrendHeatmapModule />
          </div>
        )}
        {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <GameTeardownModule />
          <BenchmarkModule />
        </div> */}
      </div>
    </DashboardShell>
  );
};

export default NewGameMarketIntelligence;
