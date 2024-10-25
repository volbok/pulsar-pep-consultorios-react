/* eslint eqeqeq: "off" */
import React, { useState } from 'react';

function Filter(setarraylist, list, parameter) {
  // eslint-disable-next-line
  const [statefilter, setstatefilter] = useState();
  var timeout = null;
  const filter = () => {
    clearTimeout(timeout);
    document.getElementById("filterInput").focus();
    let search = document.getElementById("filterInput").value.toUpperCase();
    timeout = setTimeout(() => {
      // eslint-disable-next-line
      if (search == '') {
        setstatefilter('');
        setarraylist(list);
        document.getElementById("filterInput").value = '';
        setTimeout(() => {
          document.getElementById("filterInput").focus();
        }, 100);
      } else {
        setstatefilter(document.getElementById("filterInput").value.toUpperCase());
        // eslint-disable-next-line
        setarraylist(list.filter(item => eval(parameter).toUpperCase().includes(search.toUpperCase())));
        document.getElementById("filterInput").value = search;
        setTimeout(() => {
          document.getElementById("filterInput").focus();
        }, 100);
      }
    }, 1000);
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
      <input
        className="input cor2"
        autoComplete="off"
        placeholder={"FILTRAR..."}
        onFocus={(e) => (e.target.placeholder = "")}
        onBlur={(e) => (e.target.placeholder = "FILTRAR...")}
        onKeyUp={() => filter()}
        type="text"
        id={"filterInput"}
        // defaultValue={setfilter}
        maxLength={100}
        style={{ width: '100%' }}
      ></input>
    </div>
  );
}

export default Filter;
