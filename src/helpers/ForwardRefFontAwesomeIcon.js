import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ForwardRefFontAwesomeIcon = React.forwardRef((props, ref) => (
  <span ref={ref}>
    <FontAwesomeIcon {...props} />
  </span>
));

export default ForwardRefFontAwesomeIcon;
