import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import _ from "lodash";

const SliderComponent = ({ id, initialValue, max, onChange, disabled }) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  // Update local value if initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounced change handler to limit the frequency of onChange calls
  const debouncedOnChange = useCallback(_.debounce(onChange, 100), [onChange]);

  const handleChange = (newValue) => {
    setValue(newValue);
    debouncedOnChange(id, newValue);
  };

  const handleInputChange = (e) => {
    const inputValue = Number(e.target.value);
    if (!isNaN(inputValue) && inputValue >= 0 && inputValue <= max) {
      setValue(inputValue);
      debouncedOnChange(id, inputValue);
    }
  };
  const percentage = useMemo(
    () => ((value / max) * 100).toFixed(2),
    [value, max]
  );

  useEffect(() => {
    if (inputRef.current) {
      const length = value.toString().length;
      inputRef.current.style.width = `${length + 2}ch`;
    }
  }, [value]);
  return (
    <>
      {/* <p className="text-center text-muted m-0">
        {percentage}%,
        {value}
      </p> */}

      <p className="m-0 text-center text-muted">
        {percentage}%,&nbsp;
        <input
          className="m-0 p-0"
          type="number"
          value={value}
          onChange={handleInputChange}
          ref={inputRef}
          style={{ width: "auto" }}
          disabled={disabled}
        />
      </p>
      <Slider
        min={0}
        max={max}
        step={1}
        disabled={disabled}
        value={value}
        onChange={handleChange}
      />
    </>
  );
};

export default SliderComponent;
