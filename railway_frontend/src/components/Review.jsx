import React, { Component } from 'react';
import Progress from "./Progress";
import Captcha from './Captcha';


class Review extends Component {
    state = { 
        origin: localStorage.getItem("origin"),
        destination: localStorage.getItem("destination"),
        date: localStorage.getItem("date").split(" "),
        train: localStorage.getItem(this.props.match.params.trainId).split("+"),
        trainClass: localStorage.getItem("class"),
        ticket_id: localStorage.getItem("ticket"),
        passengers: []
    }

    componentDidMount() {
        fetch('http://127.0.0.1:8000/railways/passengers/')
            .then(response => response.json())
            .then(data => {
                let passengers = data.filter(p => p.ticket_id === localStorage.getItem("ticket"))
                this.setState({passengers})
            })
            .catch(error => {
                console.error('Error fetching stations:', error);
            });
    }

    render() { 
        const {origin, date, destination, train, passengers} = this.state
        const start = train[1].split(" ")
        const end = train[2].split(" ")
        const duration = train[3].split(" ")[1].split(":")
        const endDate = new Date(`${end[2]} ${end[3]} ${end[4]}`).toString().split(" ")
        const urlParams = new URLSearchParams(window.location.search);
        const farePerPassenger = parseFloat(urlParams.get('totalfare')) || 0;
        const totalFare = parseInt(farePerPassenger) + parseInt(localStorage.getItem("convenienceFee"))
        return (
            <div>
                <Progress step={2}/>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <div style={{ flex: 1 }}>
                        <div style={styles.trainInfo}>
                            <div style={styles.header}>
                                <h2>{train[0]}</h2>
                            </div>
                            <div style={styles.body}>
                                <div>{` ${start[start.length - 1].split(":")[0]}:${start[start.length - 1].split(":")[1]} | ${origin} \n ${date[0]}, ${date[1]} ${date[2]}`}</div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <p style={{ marginBottom: "30px" }}>_____</p>
                                    <span style={{ margin: '0 10px' }}>{duration[0]}:{duration[1]}</span>
                                    <p style={{ marginBottom: "30px" }}>_____</p>
                                </div>
                                <div>{`${end[end.length - 1].split(":")[0]}:${end[end.length - 1].split(":")[1]} | ${destination} ${endDate[0]}, ${endDate[1]} ${endDate[2]}`}</div>
                            </div>
                            <div style={styles.flex}>
                                {localStorage.getItem("boarding")}
                            </div>
                        </div>
                        <div>
                            {passengers.length > 0 && (
                                <div style={{ marginTop: '20px', marginLeft:"22px" }}>
                                    <h2 style={{ marginBottom: '10px', fontSize: '1.2em', color: '#333' }}>Passenger Details</h2>
                                    <ul style={{ listStyleType: 'none', padding: '0' }}>
                                        {passengers.map((passenger, index) => (
                                            <li key={index} style={{ marginBottom: '10px', padding: '10px 10px 0 10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <p style={{ marginTop: '0'}}>Name: <i>{passenger.name}</i>{" , "} Age: <i>{passenger.age}</i>{" , "} Gender: <i>{passenger.gender}</i></p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div>
                                <p style={{ fontSize: '1em', marginBottom: '0.5em', fontWeight:"bold", marginLeft: "22px" }}>{localStorage.getItem("contact")} </p>
                            </div>
                            <Captcha totalFare={totalFare}/>
                        </div>
                    </div>
                    <div >
                    <div className="fare-summary">
                        <div className="fare-heading">Fare Summary</div>
                        <p className='fare-text'><strong>Ticket Fare:</strong>  Rs.{farePerPassenger}.00</p>
                        <p className='fare-text'><strong>Convenience Fee(Incl. GST):</strong> Rs.{localStorage.getItem("convenienceFee")}.00</p>
                        <p className='fare-text'><strong>Total fare:</strong> Rs. {totalFare}.00</p>
                    </div>
                    </div>
                </div>
            </div>
        );        
    }
}
 
const styles = {
    flex:{
        display:"flex",
        justifyContent:"center"
    },
    trainInfo: {
        border: '1px solid #ddd',
        borderRadius: '5px',
        padding: '10px',
        margin: '10px',
        marginLeft:"25px",
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '95%',
    },    
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        padding:"0px 30px",
        alignItems: 'center',
        marginBottom: '10px',
    },
    body: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    dashIcon: {
        margin: '0 5px',
        color: '#888',
    },
}

export default Review;
