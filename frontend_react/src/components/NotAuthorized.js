import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

const NotAuthorized = () => {
    const navigate = useNavigate();


    useEffect( () => {
        const delaySetup = async () => {
            await delay(3000);
            navigate('/');
        }
        delaySetup();
    })

    return <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh', fontFamily:'Montserrat', fontWeight:'bold', fontSize: 'x-large'}}>
        You don't have permission to view the page you have visited.
    </div>

} 

export default NotAuthorized;