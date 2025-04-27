import React, { useContext, useEffect, useState } from "react";
import Context from "../pages/Context";

export default function Logo({ height, width, color1 }) {

  const {
    logocor,
  } = useContext(Context);

  // var cor1 = color1;
  const [cor1, setcor1] = useState(color1);
  var cor2 = 'white';

  useEffect(() => {
    //eslint-disable-next-line
    setcor1(logocor);
  }, [logocor]);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120.24 120.24">
      <defs />
      <ellipse
        id="shape0"
        transform="matrix(0.726566844178468 0.321432378310692 -0.321432378310692 0.726566844178468 28.2990047407711 36.7967101967446)" rx="48.36" ry="11.451282028" cx="48.36" cy="11.451282028"
        fill={cor2} fillRule="evenodd"
        stroke="#000000" strokeOpacity="0" strokeWidth="12" strokeLinecap="square" strokeLinejoin="bevel" />
      <ellipse
        id="shape1"
        transform="matrix(0.79449238693526 0 0 0.79449238693526 36.5875665050289 37.3985647674374)" rx="29.16" ry="29.28" cx="29.16" cy="29.28"
        fill={cor2} fillRule="evenodd"
        stroke="#000000" strokeOpacity="0" strokeWidth="0" strokeLinecap="square" strokeLinejoin="bevel" />
      <circle
        id="shape2"
        transform="matrix(0.79449238693526 0 0 0.79449238693526 40.4011299627821 41.3074673108845)" r="24.36" cx="24.36" cy="24.36"
        fill={cor1} fillRule="evenodd"
        stroke="#000000" strokeOpacity="0" strokeWidth="1" strokeLinecap="square" strokeLinejoin="bevel" />
      <ellipse
        id="shape01"
        transform="matrix(0.794492354485259 0 0 0.79449239774526 54.6521433599712 43.4840113035538)" rx="6.4227441827" ry="6.4491752287" cx="6.4227441827" cy="6.4491752287"
        fill={cor2} fillRule="evenodd"
        stroke="#000000" strokeOpacity="0" strokeWidth="0" strokeLinecap="square" strokeLinejoin="bevel" />
      <path
        id="shape011"
        transform="matrix(0.79449238693526 0 0 0.79449238693526 33.6088775001084 42.26633009792)"
        fill="none"
        stroke={cor2} strokeWidth="3.6" strokeLinecap="square" strokeLinejoin="miter" strokeMiterlimit="2" d="M0 3.49115C7.94694 4.08134 13.6394 3.22745 19.1081 0" />
      <path
        id="shape02"
        transform="matrix(-0.515882807115374 -0.604221040254825 -0.604221030944825 0.515882799155374 90.53725546452 67.4597842295167)"
        fill="none"
        stroke={cor2} strokeWidth="3.6" strokeLinecap="square" strokeLinejoin="miter" strokeMiterlimit="2" d="M0 3.49115C7.72409 4.08134 13.2569 3.22745 18.5723 0" />
      <path
        id="shape3"
        transform="matrix(0.79449238693526 0 0 0.79449238693526 32.4747876629597 49.0299881520858)"
        fill="none"
        stroke={cor2} strokeWidth="9.6" strokeLinecap="square" strokeLinejoin="miter" strokeMiterlimit="2" d="M0 0C18.1533 18.6631 41.2464 29.3397 69.6045 31.5046" />
      <circle
        id="shape021"
        transform="matrix(0.999999986506388 0 0 1.00000002406639 68.8987178650813 25.1996043647059)" r="5.4929930051" cx="5.4929930051" cy="5.4929930051"
        fill={cor2} fillRule="evenodd"
        stroke="#000000" strokeOpacity="0" strokeWidth="0" strokeLinecap="square" strokeLinejoin="bevel" />
      <circle
        id="shape03"
        transform="matrix(1.00000001956639 0 0 0.999999996456388 76.1609447211049 14.8040863600151)" r="3.8334923875" cx="3.8334923875" cy="3.8334923875"
        fill={cor2} fillRule="evenodd"
        stroke="#000000" strokeOpacity="0" strokeWidth="0" strokeLinecap="square" strokeLinejoin="bevel" />
      <circle
        id="shape0111"
        transform="matrix(1.00000000950639 0 0 0.999999978206387 81.2498200425158 6.21501814331842)" r="3.0600958199" cx="3.0600958199" cy="3.0600958199"
        fill={cor2} fillRule="evenodd"
        stroke="#000000" strokeOpacity="0" strokeWidth="0" strokeLinecap="square" strokeLinejoin="bevel" />
      <circle
        id="shape0211"
        transform="matrix(-0.999999955246387 0 0 -1.00000001640639 50.4566569534325 96.9330541491502)" r="5.4929930051" cx="5.4929930051" cy="5.4929930051"
        fill={cor2} fillRule="evenodd"
        stroke="#000000" strokeOpacity="0" strokeWidth="0" strokeLinecap="square" strokeLinejoin="bevel" />
      <circle
        id="shape031"
        transform="matrix(-0.999999988306388 0 0 -0.999999988806388 43.194430324409 107.328572076841)" r="3.8334923875" cx="3.8334923875" cy="3.8334923875"
        fill={cor2} fillRule="evenodd"
        stroke="#000000" strokeOpacity="0" strokeWidth="0" strokeLinecap="square" strokeLinejoin="bevel" />
      <circle
        id="shape012"
        transform="matrix(-0.999999978246387 0 0 -0.999999970556387 38.1055551619981 115.917640229438)" r="3.0600958199" cx="3.0600958199" cy="3.0600958199"
        fill={cor2} fillRule="evenodd"
        stroke="#000000" strokeOpacity="0" strokeWidth="0" strokeLinecap="square" strokeLinejoin="bevel" />
    </svg>
  )
}
