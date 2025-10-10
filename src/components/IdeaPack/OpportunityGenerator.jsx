import { useState, useEffect } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Info, Sparkles, Loader } from "lucide-react";
import SelectDropdown from "../SelectDropdown";
import api from "../../api";

const OpportunityGenerator = () => {
  const [genre, setGenre] = useState([]);
  const [subGenre, setSubGenre] = useState([]);
  // Countries - custom multi-select dropdown UI
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [platform, setPlatform] = useState("android");
  const [gender, setGender] = useState("male");
  const [targetAgeGroup, setTargetAgeGroup] = useState([]);
  const [timeRange, setTimeRange] = useState(3);
  const [spend, setSpend] = useState(50); // in K
  const [monetization, setMonetization] = useState("ads");
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true);
        const res = await api.get(`/v1/ideapac/countries`);
        if (isCancelled) return;
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setCountries(list);
      } catch (e) {
        if (!isCancelled) {
          // Keep UI resilient if fetch fails
          setCountries([]);
        }
      } finally {
        if (!isCancelled) setCountriesLoading(false);
      }
    };
    const fetchGenres = async () => {
      try {
        setGenresLoading(true);
        const res = await api.get(`/v1/ideapac/genres`);
        if (isCancelled) return;
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setGenres(list);
      } catch (e) {
        if (!isCancelled) setGenres([]);
      } finally {
        if (!isCancelled) setGenresLoading(false);
      }
    };
    fetchCountries();
    fetchGenres();
    return () => {
      isCancelled = true;
    };
  }, []);

  // No-op: SelectDropdown handles its own outside-click behavior

  const selectedGenreObjects = genres.filter((g) =>
    genre.includes(g?.genre_name)
  );
  const subgenreOptions = selectedGenreObjects.flatMap((g) =>
    Array.isArray(g?.subgenres) ? g.subgenres : []
  );

  const valueToPercent = (value, min = 0, max = 90) => {
    return ((value - min) / (max - min)) * 100;
  };

  // Country selection is handled via SelectDropdown

  const handleGenerate = async () => {
    if (isGenerating) return;
    try {
      setIsGenerating(true);
      const payload = {
        studio_id: 63,
        genre,
        sub_genre: subGenre,
        country: selectedCountries,
        platform,
        gender,
        target_age: targetAgeGroup,
        time_period: timeRange,
        monetization_focus: monetization,
        simulate: true,
      };
      const res = await api.post(
        `/v1/ideapac/opportunity-card/generate`,
        payload
      );
      console.log("Generated opportunity card:", res?.data);
    } catch (e) {
      console.error("Failed to generate opportunity card", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[#0F0F0F4D] rounded-[10px] p-6 border-[0.5px] border-[#303030] mt-[28px]">
      <h3 className="text-white text-xl font-bold mb-6">
        Generate New Opportunity
      </h3>

      {/* Genre */}
      <div className="mb-5 flex items-center gap-4">
        <div className="text-gray-300 text-sm mb-2 flex items-center gap-1">
          Genre
          <button
            type="button"
            aria-label="Genre info"
            data-tooltip-id="tip-genre"
            className="text-gray-400 hover:text-gray-200"
          >
            <Info className="w-4 h-4" />
          </button>
          <ReactTooltip
            id="tip-genre"
            place="top"
            content="Broad game category for trend analysis."
          />
        </div>
        <SelectDropdown
          options={genres.map((g) => ({
            value: g?.genre_name,
            label: g?.genre_name,
          }))}
          value={genre}
          onChange={(vals) => {
            setGenre(vals);
            setSubGenre([]);
          }}
          placeholder="Select Genre"
          disabled={genresLoading}
          multiple
          maxSelected={3}
        />
      </div>

      {/* Sub-Genre */}
      <div className="mb-5 flex items-center gap-4">
        <div className="text-gray-300 text-sm mb-2 flex items-center gap-1">
          Sub-Genre
          <button
            type="button"
            aria-label="Sub-Genre info"
            data-tooltip-id="tip-subgenre"
            className="text-gray-400 hover:text-gray-200"
          >
            <Info className="w-4 h-4" />
          </button>
          <ReactTooltip
            id="tip-subgenre"
            place="top"
            content="Specific gameplay type within a genre."
          />
        </div>
        <SelectDropdown
          options={subgenreOptions.map((s) => ({
            value: s?.subgenre_name,
            label: s?.subgenre_name,
          }))}
          value={subGenre}
          onChange={(vals) => setSubGenre(vals)}
          placeholder="Select Sub-genre"
          disabled={genre.length === 0 || genresLoading}
          multiple
          maxSelected={3}
        />
      </div>

      {/* Country */}
      <div className="mb-5 flex items-center gap-4">
        <div className="text-gray-300 text-sm mb-2 flex items-center gap-1">
          Region / Country
          <button
            type="button"
            aria-label="Region or Country info"
            data-tooltip-id="tip-country"
            className="text-gray-400 hover:text-gray-200"
          >
            <Info className="w-4 h-4" />
          </button>
          <ReactTooltip
            id="tip-country"
            place="top"
            content="Target market for regional insights."
          />
        </div>
        <SelectDropdown
          options={countries.map((c) => ({ value: c, label: c }))}
          value={selectedCountries}
          onChange={(vals) => setSelectedCountries(vals)}
          placeholder="Select Country"
          disabled={countriesLoading}
          multiple
          maxSelected={3}
          menuWidth={240}
        />
      </div>

      {/* Platform */}
      <div className="mb-5 flex items-center gap-4">
        <div className="text-gray-300 text-sm mb-2 flex items-center gap-1">
          Platform
          <button
            type="button"
            aria-label="Platform info"
            data-tooltip-id="tip-platform"
            className="text-gray-400 hover:text-gray-200"
          >
            <Info className="w-4 h-4" />
          </button>
          <ReactTooltip
            id="tip-platform"
            place="top"
            content="Operating system or store segment."
          />
        </div>
        <div className="flex gap-3">
          {[
            { id: "ios", label: "iOS" },
            { id: "android", label: "Android" },
            { id: "unified", label: "Unified" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`px-4 py-2 rounded-md text-sm  ${
                platform === p.id
                  ? "bg-white text-black "
                  : "bg-[#454545] text-gray-200 "
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="mb-5 flex items-center gap-4">
        <div className="text-gray-300 text-sm mb-2 flex items-center gap-1">
          Gender
          <button
            type="button"
            aria-label="Gender info"
            data-tooltip-id="tip-gender"
            className="text-gray-400 hover:text-gray-200"
          >
            <Info className="w-4 h-4" />
          </button>
          <ReactTooltip
            id="tip-gender"
            place="top"
            content="Primary audience by gender segment."
          />
        </div>
        <div className="flex gap-3">
          {[
            { id: "male", label: "Male" },
            { id: "female", label: "Female" },
            { id: "all", label: "All" },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setGender(g.id)}
              className={`px-4 py-2 rounded-md text-sm  ${
                gender === g.id
                  ? "bg-white text-black "
                  : "bg-[#454545] text-gray-200 "
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Age */}
      <div className="mb-5 flex items-center gap-4">
        <div className="text-gray-300 text-sm mb-2 flex items-center gap-1">
          Target Age
          <button
            type="button"
            aria-label="Target Age info"
            data-tooltip-id="tip-age"
            className="text-gray-400 hover:text-gray-200"
          >
            <Info className="w-4 h-4" />
          </button>
          <ReactTooltip
            id="tip-age"
            place="top"
            content="Intended player age group."
          />
        </div>
        <SelectDropdown
          options={[
            { value: "[0,12]", label: "0 - 12 Years" },
            { value: "[12,18]", label: "12 - 18 Years" },
            { value: "[18,25]", label: "18 - 25 Years" },
            { value: "[25,35]", label: "25 - 35 Years" },
            { value: "[35,40]", label: "35 - 40 Years" },
            { value: "[40,100]", label: "40+ Years" },
          ]}
          value={targetAgeGroup}
          onChange={(vals) => setTargetAgeGroup(vals)}
          placeholder="Select Age Groups"
          multiple
          maxSelected={3}
        />
      </div>

      {/* Time Period */}
      <div className="mb-[42px] flex items-center gap-4">
        <div className="text-gray-300 text-sm mb-2 flex items-center gap-1">
          Time Period
          <button
            type="button"
            aria-label="Time Period info"
            data-tooltip-id="tip-time"
            className="text-gray-400 hover:text-gray-200"
          >
            <Info className="w-4 h-4" />
          </button>
          <ReactTooltip
            id="tip-time"
            place="top"
            content="Historical window for analysis."
          />
        </div>
        <div className="flex gap-3">
          {[2, 3].map((yr) => (
            <button
              key={yr}
              onClick={() => setTimeRange(yr)}
              className={`px-4 py-2 rounded-md text-sm  ${
                timeRange === yr
                  ? "bg-white text-black "
                  : "bg-[#454545] text-gray-200 "
              }`}
            >
              {yr} Years
            </button>
          ))}
        </div>
      </div>

      {/* UA Spend */}
      <div className="mb-5 ">
        <div className="flex items-center gap-4">
          <div className="text-gray-300 text-sm whitespace-nowrap flex items-center gap-1">
            UA Spend
            <button
              type="button"
              aria-label="UA Spend info"
              data-tooltip-id="tip-spend"
              className="text-gray-400 hover:text-gray-200"
            >
              <Info className="w-4 h-4" />
            </button>
            <ReactTooltip
              id="tip-spend"
              place="top"
              content="Max UA budget or spend intent."
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">0</span>
              <div className="relative h-8 flex-1">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#6B7280] rounded-full" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1 bg-white rounded-full"
                  style={{
                    left: `0%`,
                    right: `${100 - valueToPercent(spend, 0, 100)}%`,
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={spend}
                  onChange={(e) => setSpend(parseInt(e.target.value, 10))}
                  className="range-input absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-auto z-10"
                />
                <div
                  className="absolute -top-6 text-xs text-gray-200"
                  style={{
                    left: `calc(${valueToPercent(spend, 0, 100)}% - 14px)`,
                  }}
                >
                  <span className="bg-white text-black px-2 py-0.5 rounded">
                    {spend}K
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-400">$100K +</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monetization Focus */}
      <div className="mb-7 flex items-center gap-4">
        <div className="text-gray-300 text-sm mb-2 flex items-center gap-1">
          Monetization Focus
          <button
            type="button"
            aria-label="Monetization Focus info"
            data-tooltip-id="tip-monetization"
            className="text-gray-400 hover:text-gray-200"
          >
            <Info className="w-4 h-4" />
          </button>
          <ReactTooltip
            id="tip-monetization"
            place="top"
            content="Core revenue model—Ads, IAP, or Hybrid."
          />
        </div>
        <div className="flex gap-3">
          {[
            { id: "iap", label: "IAP" },
            { id: "ads", label: "Ads" },
            { id: "hybrid", label: "Hybrid" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMonetization(m.id)}
              className={`px-4 py-2 rounded-md text-sm  ${
                monetization === m.id
                  ? "bg-white text-black "
                  : "bg-[#454545] text-gray-200 "
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      {(() => {
        const isFormValid =
          Array.isArray(genre) &&
          genre.length > 0 &&
          Array.isArray(subGenre) &&
          subGenre.length > 0 &&
          Array.isArray(selectedCountries) &&
          selectedCountries.length > 0 &&
          Array.isArray(targetAgeGroup) &&
          targetAgeGroup.length > 0 &&
          typeof platform === "string" &&
          platform.length > 0 &&
          typeof gender === "string" &&
          gender.length > 0 &&
          typeof monetization === "string" &&
          monetization.length > 0 &&
          (timeRange === 2 || timeRange === 3);
        const disabled = isGenerating || !isFormValid;
        return (
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={disabled}
              aria-busy={isGenerating}
              className="w-full bg-white text-black rounded-2xl py-3 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  Generating... <Loader className="w-4 h-4 animate-spin" />
                </>
              ) : (
                <>
                  Generate <Sparkles className="w-4 h-4 font-normal" />
                </>
              )}
            </button>
          </div>
        );
      })()}
    </div>
  );
};

export default OpportunityGenerator;
