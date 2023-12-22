import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

const UserVerified = () => {
    const navigate = useNavigate();


    useEffect( () => {
        const delaySetup = async () => {
            await delay(3000);
            navigate('/');
        }
        delaySetup();
    })

    return <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh', fontFamily:'Montserrat', fontWeight:'bold', fontSize: 'x-large'}}>
        Your email has been verified. Enjoy using SuLaunch.
    </div>

} 

export default UserVerified;