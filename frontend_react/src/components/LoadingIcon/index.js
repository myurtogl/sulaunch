import React from "react";

export default function LoadingIcon() {

    const CustomLoading = () => (
        <div className='custom' style={{margin:"auto", height:"100vh", display:"flex", flexDirection:"column", justifyContent:"center"}}>
          <div className='balls'>
            <div className='ball ball1'></div>
            <div className='ball ball2'></div>
            <div className='ball ball3'></div>
          </div>
          <span className='customText'>Loading...</span>
        </div>
      )

    return <CustomLoading />;
}
