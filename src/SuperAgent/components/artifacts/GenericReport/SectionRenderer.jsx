import MetricCards from "./sections/MetricCards";
import Table from "./sections/Table";
import List from "./sections/List";
import TextBlock from "./sections/TextBlock";
import KVPairs from "./sections/KVPairs";
import ScoreList from "./sections/ScoreList";
import TwoColumn from "./sections/TwoColumn";
import AlertList from "./sections/AlertList";

const SectionRenderer = ({ section }) => {
  if (!section) return null;

  switch (section.type) {
    case "metric_cards":
      return <MetricCards section={section} />;
    case "table":
      return <Table section={section} />;
    case "list":
      return <List section={section} />;
    case "text":
      return <TextBlock section={section} />;
    case "kv_pairs":
      return <KVPairs section={section} />;
    case "score_list":
      return <ScoreList section={section} />;
    case "two_column":
      return <TwoColumn section={section} />;
    case "alert_list":
      return <AlertList section={section} />;
    default:
      return null;
  }
};

export default SectionRenderer;
