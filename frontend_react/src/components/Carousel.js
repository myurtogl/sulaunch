import Carousel from 'react-bootstrap/Carousel';
import { useNavigate } from 'react-router-dom';

const BasicCarousel = 
({ list }) => {


    const navigate = useNavigate();

    const navigateProjectDetail = (projectId) => { navigate('projects/' + projectId) }

    const navigateAuctionDetail = (auctionIndex) => { navigate('auction/' + auctionIndex, { state: list[auctionIndex] }) }
    var navigateTarget = navigateProjectDetail
    return (
        <Carousel indicators={false} style={{display: "flex", justifyContent: "center", width: '100vw' ,height: '100vh' }}>
            {list.slice(0, 3).map((item, index) => {
                return (
                            <Carousel.Item key={item.projectID} interval={2000} >
                            <button onClick={() => navigateTarget(item.projectID)} style={{ height: '100vh'}}>
                                <div style={{backgroundColor:"#fff",display: "flex",justifyContent: "center",width: "100vw", height:"100vh"}}>
                                    <div style={{height:"15vh"}}></div>
                                    <div style={{height:"100vh",display:'flex',justifyContent: "center",alignItems:"center"  }}>
                                        <img
                                        src={item.imageURL}
                                        alt="First slide"
                                        style={{height:"50vh", boxShadow:" 0px 0px 30px 0px rgba(0,0,0,0.75)",
                                        WebkitBoxShadow: "0px 0px 30px 0px rgba(0,0,0,0.75)",
                                        MozBoxShadow:" 0px 0px 30px 0px rgba(0,0,0,0.75)"}}
                                        />
                                    </div>
                                </div>
                            </button>
                            <Carousel.Caption>
                                <div >
                                    <h3 style={{fontFamily: "Montserrat, sans-serif", fontSize: "larger",color:'#173a6a'}}>{item.projectName}</h3>
                                    <p style={{fontFamily: "Montserrat, sans-serif",color:"#5082C7"}}>{item.projectDescription}</p>
                                </div>
                            </Carousel.Caption>
                        </Carousel.Item>
            )
            })}


        </Carousel>
    );
}

export default BasicCarousel;