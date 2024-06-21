import NoDataImage from "../assets/No-Data.png";

export default function NoData({ type, next }) {
  return (
    <div className="py-3 text-center">
      <img src={NoDataImage} alt="no-data" className="w-5/12 mx-auto" />
      <p className="text-xl font-bold mb-2 text-[#09213a]">No {type} found</p>
      {type === "reviews" && (
        <p>
          Try changing the filter settings or search terms to find the reviews
          you are looking for.
        </p>
      )}
      {type === "game" || type === "templates" ? (
        <button
          onClick={next}
          className="bg-[#ff1053] text-white px-8 py-2 rounded capitalize"
        >
          Add {type}
        </button>
      ) : (
        <></>
      )}
    </div>
  );
}
