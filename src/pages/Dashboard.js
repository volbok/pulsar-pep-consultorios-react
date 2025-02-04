/* eslint eqeqeq: "off" */
import React, { useEffect, useContext } from "react";
// import axios from "axios";
import Context from "./Context";
// imagens.
// import back from '../images/back.png';

function Dashboard() {
  // context.
  const {
    pagina,
  } = useContext(Context);

  useEffect(() => {
    if (pagina == 'DASHBOARD') {
    }
    // eslint-disable-next-line
  }, [pagina]);

  return (
    <div
      className='main'
      style={{
        display: pagina == 'DASHBOARD' ? 'flex' : 'none',
        flexDirection: 'column',
      }}>
      PÁGINA EM CONSTRUÇÃO...
    </div>
  )

}

export default Dashboard;