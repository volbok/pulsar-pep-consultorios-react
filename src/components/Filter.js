/* eslint eqeqeq: "off" */
import React, { useState } from 'react';

function Filter(input_id, setarraylist, list, parameter) {

  const normalizer = (string) => {
    let newstring = string.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    return (newstring);
  }

  // eslint-disable-next-line
  const [statefilter, setstatefilter] = useState();
  var timeout = null;
  const filter = () => {
    clearTimeout(timeout);
    document.getElementById(input_id).focus();
    let search = document.getElementById(input_id).value.toUpperCase();
    timeout = setTimeout(() => {
      // eslint-disable-next-line
      if (search == '') {
        setstatefilter('');
        setarraylist(list);
        document.getElementById(input_id).value = '';
        setTimeout(() => {
          document.getElementById(input_id).focus();
        }, 100);
      } else {
        setstatefilter(document.getElementById(input_id).value.toUpperCase());
        // eslint-disable-next-line
        setarraylist(list.filter(item => normalizer(eval(parameter)).toUpperCase().includes(normalizer(search).toUpperCase())));
        document.getElementById(input_id).value = search;
        // normalize
        setTimeout(() => {
          document.getElementById(input_id).focus();
        }, 100);
      }
    }, 1000);
  }
  return (
    <div style={{
      display: 'flex', flexDirection: 'row', justifyContent: 'center',
      width: '100%'
    }}>
      <input
        title={input_id}
        className="input"
        autoComplete="off"
        placeholder={"FILTRAR..."}
        onFocus={(e) => (e.target.placeholder = "")}
        onBlur={(e) => (e.target.placeholder = "FILTRAR...")}
        onKeyUp={() => filter()}
        type="text"
        id={input_id}
        // defaultValue={setfilter}
        maxLength={100}
        style={{ width: '100%', minWidth: 150 }}
      ></input>
    </div>
  );
}

export default Filter;
