import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

const defaultGetOptionLabel = (o) =>
  typeof o === "string" ? o : o?.label ?? "";
const defaultGetOptionValue = (o) =>
  typeof o === "string" ? o : o?.value ?? o?.label ?? "";



const SelectDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  disabled = false,
  multiple = false,
  maxSelected,
  getOptionLabel = defaultGetOptionLabel,
  getOptionValue = defaultGetOptionValue,
  buttonClassName = "",
  menuWidth = 240,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const labelText = useMemo(() => {
    if (multiple) {
      const selectedValues = Array.isArray(value) ? value : [];
      if (selectedValues.length === 0) return placeholder;
      const labels = options
        .filter((o) => selectedValues.includes(getOptionValue(o)))
        .map((o) => getOptionLabel(o));
      if (labels.length <= 2) return labels.join(", ");
      return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
    }
    if (!value) return placeholder;
    const found = options.find((o) => getOptionValue(o) === value);
    return found ? getOptionLabel(found) : placeholder;
  }, [multiple, value, options, placeholder, getOptionLabel, getOptionValue]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    const optValue = getOptionValue(opt);
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const exists = current.includes(optValue);
      // Enforce maxSelected when adding new items
      if (
        !exists &&
        typeof maxSelected === "number" &&
        maxSelected > 0 &&
        current.length >= maxSelected
      ) {
        return;
      }
      const next = exists
        ? current.filter((v) => v !== optValue)
        : [...current, optValue];
      onChange?.(next);
    } else {
      onChange?.(optValue);
      setIsOpen(false);
    }
  };

  const isSelected = (opt) => {
    const optValue = getOptionValue(opt);
    return multiple
      ? Array.isArray(value) && value.includes(optValue)
      : value === optValue;
  };

  const limitReached = useMemo(() => {
    return (
      multiple &&
      typeof maxSelected === "number" &&
      maxSelected > 0 &&
      Array.isArray(value) &&
      value.length >= maxSelected
    );
  }, [multiple, maxSelected, value]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`appearance-none bg-[#454545] border border-[#3f3f3f] text-gray-200 text-sm rounded-md px-4 py-2 pr-9 focus:outline-none min-w-[180px] text-left relative ${buttonClassName}`}
      >
        {labelText}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-200">
          <ChevronDownIcon className="w-4 h-4" />
        </span>
      </button>
      {isOpen && (
        <div
          className="absolute z-20 mt-2 bg-[#454545] border border-[#3f3f3f] rounded-xl shadow-lg p-2"
          style={{ width: menuWidth }}
        >
          <ul className="max-h-60 overflow-y-auto pr-1" role="listbox">
            {options.map((opt) => {
              const selected = isSelected(opt);
              return (
                <li
                  key={getOptionValue(opt)}
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#5a5a5a] cursor-pointer ${
                    limitReached && !selected
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={limitReached && !selected}
                >
                  <span
                    className={`inline-block w-3 h-3 rounded-full border ${
                      selected ? "bg-white border-white" : "border-gray-300"
                    }`}
                  />
                  <span className="text-gray-200 text-sm">
                    {getOptionLabel(opt)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
