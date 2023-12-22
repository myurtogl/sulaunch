import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

// Redirect Page
const InstallMetamask = () => {
    useEffect(() => {
        window.location.replace('https://metamask.io/download/');
    }, [])

    // Render some text when redirecting
    // You can use a loading gif or something like that
    return 
    <div style={{display: "flex", justifyContent: "center", }}>
        <h1 style={{fontFamily: "Montserrat, sans-serif", fontSize: "larger", }}>Redirecting...</h1>
    </div>
}

export default InstallMetamask;