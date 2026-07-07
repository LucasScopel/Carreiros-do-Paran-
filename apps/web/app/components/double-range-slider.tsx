import { useCallback, useEffect, useState, useRef } from "react";

interface DoubleRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (values: { min: number; max: number }) => void;
}

export default function DoubleRangeSlider({
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: DoubleRangeSliderProps) {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);

  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const rangeRef = useRef<HTMLDivElement>(null);

  const getPercent = useCallback(
    (value: number) => ((value - min) / (max - min)) * 100,
    [min, max],
  );

  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (rangeRef.current) {
      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (rangeRef.current) {
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  const handleTriggerChange = () => {
    onChange({ min: minVal, max: maxVal });
  };

  return (
    <div className="flex flex-col w-full px-2">
      <div className="relative w-full h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(event) => {
            const value = Math.min(Number(event.target.value), maxVal - 1);
            setMinVal(value);
            minValRef.current = value;
          }}
          onMouseUp={handleTriggerChange}
          onTouchEnd={handleTriggerChange}
          className="double-range-slider-thumb absolute w-full h-0 outline-none appearance-none bg-transparent pointer-events-none z-1"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(event) => {
            const value = Math.max(Number(event.target.value), minVal + 1);
            setMaxVal(value);
            maxValRef.current = value;
          }}
          onMouseUp={handleTriggerChange}
          onTouchEnd={handleTriggerChange}
          className="double-range-slider-thumb absolute w-full h-0 outline-none appearance-none bg-transparent pointer-events-none z-2"
        />

        <div className="relative w-full h-1 bg-gray-200 rounded">
          <div ref={rangeRef} className="absolute h-1 bg-emerald-600 rounded" />
        </div>
      </div>

      <div className="flex justify-between items-center mt-3 text-sm text-gray-600 font-medium select-none">
        <span>
          Mín: {minVal} {suffix}
        </span>
        <span>
          Máx: {maxVal} {suffix}
        </span>
      </div>
    </div>
  );
}
