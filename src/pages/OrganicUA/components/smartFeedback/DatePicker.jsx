import moment from "moment";
import { DateRangePicker, defaultStaticRanges } from "react-date-range";

const customStaticRanges = [
  {
    label: "180 Days",
    range: () => ({
      startDate: moment().subtract(180, "days").toDate(),
      endDate: new Date(),
    }),
    isSelected(range) {
      const definedRange = this.range();
      return (
        moment(range.startDate).isSame(definedRange.startDate, "day") &&
        moment(range.endDate).isSame(definedRange.endDate, "day")
      );
    },
  },
  {
    label: "360 Days",
    range: () => ({
      startDate: moment().subtract(360, "days").toDate(),
      endDate: new Date(),
    }),
    isSelected(range) {
      const definedRange = this.range();
      return (
        moment(range.startDate).isSame(definedRange.startDate, "day") &&
        moment(range.endDate).isSame(definedRange.endDate, "day")
      );
    },
  },
];

const DatePicker = ({
  setCustomDates,
  customDates,
  wrapperRef,
  page,
  isCustomBtnAction,
}) => {
  return (
    <div ref={wrapperRef} className="relative">
      <DateRangePicker
        onChange={(item) => setCustomDates([item.selection])}
        showSelectionPreview={true}
        moveRangeOnFirstSelection={false}
        months={2}
        ranges={customDates}
        direction="horizontal"
        className={`z-50 border border-[#eff2f7] ${
          page === "reviewInsights" ? "mt-4 absolute top-6" : "relative"
        }`}
        staticRanges={[...defaultStaticRanges, ...customStaticRanges]}
      />
      <button
        onClick={() => isCustomBtnAction()}
        className={`z-50 absolute right-[-620px] bottom-[10px] mt-2 bg-[#ff1053] text-white font-bold py-1 px-4 rounded ${page === "reviewInsights" ? "bottom-[-460px]" : ""}`}
      >
        Apply
      </button>
    </div>
  );
};

export default DatePicker;
