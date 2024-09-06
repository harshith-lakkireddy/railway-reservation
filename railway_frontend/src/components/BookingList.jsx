import React, { Component } from 'react';

class BookingList extends Component {
    state = {
        passengersList: [],
    };

    async componentDidMount() {
        await fetch('http://127.0.0.1:8000/railways/payments/')
            .then(response => response.json())
            .then(async payments => {
                const username = localStorage.getItem('username');
                const filteredPayments = payments.filter(payment => payment.user === username);
                if (filteredPayments.length > 0) {
                    const ticketIds = [...new Set(filteredPayments.map(payment => payment.ticket_id))];
                    let passengersL = [];
                    await Promise.all(ticketIds.map(async ticketId => {
                        const response = await fetch(`http://127.0.0.1:8000/railways/passengers/`);
                        const passengers = await response.json();
                        const filteredPassenger = passengers.find(p => p.ticket_id === ticketId);
                        if (filteredPassenger) {
                            passengersL.push(filteredPassenger);
                        }
                    }));
                    this.setState({ passengersList: passengersL });
                }
            })
            .catch(error => console.error('Error fetching payments:', error));
    }
    isCurrentDateGreaterThanInputDate = (inputDate) => {
        const currentDate = new Date().setHours(0, 0, 0, 0);
        const inputDateObj = new Date(inputDate).setHours(0, 0, 0, 0);
    
        return currentDate > inputDateObj;
    }
    

    render() {
        const { passengersList } = this.state;
        return (
            <>
            {passengersList.length === 0 && (
                <div style={styles.trainInfo}>
                    <div style={styles.header}>
                        <h2>No Bookings Yet.</h2>
                    </div>
                    <div style={{...styles.flex, fontWeight:"bold"}}>
                        <a href="/search"><button className='tab-btn-payment' style={{margin:'10px 0'}}>Book Now</button></a>
                    </div>
                </div>
            )}
            {passengersList.length !== 0 && (
                <ul>
                    {passengersList.map(passenger => {
                        const routeParts = passenger.route.split('+');
                        const train = routeParts[2]
                        const startTime = routeParts[3].slice(0, -3).split("Start Time:")[1]
                        const endTime = routeParts[4].slice(0, -3).split("End Time:")[1]
                        const start = routeParts[0]
                        const end = routeParts[1]
                        const date = routeParts[3].slice(0, -8).split("Start Time:")[1]
                        const path = `/booking?ticketId=${passenger.ticket_id}&completed=${this.isCurrentDateGreaterThanInputDate(date)}`
                        return (
                            <a href={path} style={{color:"#000"}}>
                                <div style={styles.trainInfo}>
                                    <div style={styles.header}>
                                        <h2>{train}</h2>
                                    </div>
                                    <div style={styles.body}>
                                        <div>{start} | {startTime}</div>
                                        <div>{end} | {endTime}</div>
                                    </div>
                                    <div style={{...styles.flex, fontWeight:"bold"}}>
                                        {this.isCurrentDateGreaterThanInputDate(date) ? "Journey Completed" : ""}
                                    </div>
                                </div>
                            </a>
                        )
                    })}
                </ul>
            )}   
            </>         
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
}

export default BookingList;
