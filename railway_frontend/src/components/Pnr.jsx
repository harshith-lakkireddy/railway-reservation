import React from 'react';
import Joi from 'joi-browser';

import Form from './Form';

class PNR extends Form {
    state = {
        passengers: [],
        trainName: '',
        startStation: '',
        endStation: '',
        startTime: '',
        endTime: '',
        duration: '', 
        payment: {},
        filteredClass: {},
        showTicket: false,
        data: {
            ticket_id: '',
        },
        errors:{}
    };

    schema = {
        ticket_id: Joi.string().min(6).required().label("PNR Number"),
    }

    componentDidMount() {
        this.setState({showTicket: false})
    }
    handleSubmit = async (e) => {
        e.preventDefault();
        const errors = this.validate();
        this.setState({ errors: errors || {} });
        const {ticket_id} = this.state.data;
        await fetch('http://127.0.0.1:8000/railways/passengers/')
            .then(response => response.json())
            .then(passengers => {
                const filteredPassengers = passengers.filter(passenger => passenger.ticket_id === ticket_id);
                if (filteredPassengers.length > 0) {
                    const route = filteredPassengers[0].route.split('+');
                    const trainName = route[2];
                    const startStation = route[0];
                    const endStation = route[1];
                    const s = route[3].split(" ").slice(2);
                    const startTime = s.join(" ");
                    const e = route[4].split(' ').slice(2);
                    const endTime = e.join(" ");
                    const duration = route[route.length - 1].split(" ")[1]
                    this.setState({
                        passengers: filteredPassengers,
                        trainName, 
                        startStation,
                        endStation,
                        startTime,
                        endTime,
                        duration,
                        showTicket: true
                    });
                }
            })
            .catch(error => console.error('Error fetching passengers:', error));

        await fetch('http://127.0.0.1:8000/railways/payments/')
            .then(response => response.json())
            .then(payments => {
                const filteredPayment = payments.find(payment => payment.ticket_id === ticket_id);
                if (filteredPayment) {
                    this.setState({
                        payment: filteredPayment
                    })
                }
            })
            .catch(error => console.error('Error fetching payments:', error));

        await fetch('http://127.0.0.1:8000/railways/train-classes/')
            .then(response => response.json())
            .then(classes => {
                const filteredClass = classes.find(c => c.class_code === this.state.passengers[0].train_class);
                if (filteredClass) {
                    this.setState({
                        filteredClass
                    })
                }
            })
            .catch(error => console.error('Error fetching train classes:', error));
    }

    render() {
        const { passengers, trainName, startStation, endStation, startTime, endTime, payment, filteredClass, showTicket } = this.state;
        return (
            <>
                {!showTicket ? (
                    <div className='lrbg' style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "start"
                    }}>
                        <div className="form-div" style={{ marginRight:50, marginTop:60, paddingTop:50}}>
                            <h3 className='lr-head'>Check PNR Status</h3>
                            <form onSubmit={this.handleSubmit} style={{ width: "100%" }}>
                                {this.renderInput('ticket_id', 'PNR Number')}
                                {this.renderButton("Submit")}
                            </form>
                        </div>
                    </div>
                ) :
                (<div id='ticket' style={{...styles.flex, flexDirection:'column', alignItems:"center", paddingTop:'10px'}}>
                    <div style={{...styles.trainInfo, ...styles.headText, paddingBottom:"10px"}}>
                        <div style={styles.header}>
                            <div style={{ flex: 1, paddingLeft:"70px" }}>
                                <h4>Booked From</h4>
                                <div>{startStation.toUpperCase()}</div>
                                <div>Start Date* {startTime.slice(0, -8)}</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'right', paddingRight:"100px" }}>
                                <h4>To</h4>
                                <div>{endStation.toUpperCase()}</div>
                                <div>Arrival* {endTime.slice(0, -3)}</div>
                            </div>
                        </div>
                        <div style={{...styles.flex, fontWeight:"bold"}}>
                            Departure* {startTime.slice(0, -3)}
                        </div>
                    </div>
                    <div style={{ ...styles.trainInfo, display: 'flex', justifyContent: 'space-between', borderBottom:0, paddingTop:'10px' }}>
                        <div style={{ ...styles.body, width: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{fontWeight:"bold"}}>PNR</div>
                            {passengers[0] && <div style={styles.contentText}>{passengers[0].ticket_id}</div>}
                        </div>
                        <div style={{ ...styles.body, width: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{fontWeight:"bold"}}>Train Name</div>
                            <div style={styles.contentText}>{trainName.toUpperCase()}</div>
                        </div>
                        <div style={{ ...styles.body, width: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{fontWeight:"bold"}}>Class</div>
                            {passengers[0] && <div style={styles.contentText}>{filteredClass.class_name} ({passengers[0].train_class})</div>}
                        </div>
                    </div>
                    <div style={{ ...styles.trainInfo, display: 'flex', justifyContent: 'space-between', borderTop:0, paddingBottom:'10px' }}>
                        <div style={{ ...styles.body, width: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{fontWeight:"bold"}}>Quota</div>
                            <div>General (GN)</div>
                        </div>
                        <div style={{ ...styles.body, width: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{fontWeight:"bold"}}>Booking Date</div>
                            {passengers[0] && <div>{passengers[0].booking_date}</div>}
                        </div>
                    </div>
                    <div style={styles.trainInfo}>
                        <h3 style={{ textDecoration: "underline" }}>Passenger Details</h3>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '8px', minWidth: '50px', textAlign: 'left' }}>#</th>
                                    <th style={{ padding: '8px', minWidth: '150px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '8px', minWidth: '50px', textAlign: 'left' }}>Age</th>
                                    <th style={{ padding: '8px', minWidth: '50px', textAlign: 'left' }}>Gender</th>
                                    <th style={{ padding: '8px', minWidth: '200px', textAlign: 'left' }}>Booking Status</th>
                                    <th style={{ padding: '8px', minWidth: '200px', textAlign: 'left' }}>Current Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {passengers.map((passenger, index) => (
                                    <tr key={passenger.id}>
                                        <td style={{ padding: '8px', minWidth: '50px' }}>{index + 1}</td>
                                        <td style={{ padding: '8px', minWidth: '150px' }}>{passenger.name.toUpperCase()}</td>
                                        <td style={{ padding: '8px', minWidth: '50px' }}>{passenger.age}</td>
                                        <td style={{ padding: '8px', minWidth: '50px' }}>{passenger.gender === 'male' ? "M" : "F"}</td>
                                        <td style={{ padding: '8px', minWidth: '200px' }}>CNF/S6/{passenger.seat_number}/{passenger.birth_preference.toUpperCase()}</td>
                                        <td style={{ padding: '8px', minWidth: '200px' }}>CNF/S6/{passenger.seat_number}/{passenger.birth_preference.toUpperCase()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={styles.trainInfo}>
                        <h3 style={{ textDecoration: "underline" }}>Payment Details</h3>
                        <p>Ticket Fare <span style={{ marginLeft:"225px" }}>₹ {payment.amount}</span></p>
                        <p>IRCTC Convenience Fee (Incl. Of GST) <span style={{ marginLeft:"40px" }}>₹ {payment.convenienceFee}</span></p>
                        <p>Total Fare (all inclusive) <span style={{ marginLeft:"140px" }}>₹ {parseFloat(payment.convenienceFee) + parseFloat(payment.amount)}.00</span></p>
                    </div>
                </div>)}
            </>
        );
    }
}

const styles = {
    flex: {
        display: "flex",
        justifyContent: "center"
    },
    headText:{
        fontWeight:450
    },
    contentText:{
        fontWeight:'bold',
        fontSize: 18,
        color: 'rgb(95, 171, 247)',
        marginBottom: '10px'
    },
    trainInfo: {
        border: '2px solid #000',
        marginLeft: "25px",
        marginRight: "25px",
        paddingLeft:"30px",
        width: '95%',
        borderBottom:0
    },
    header: {
        display: 'flex',
        justifyContent: 'space-around',
        padding: "0px 5px",
        alignItems: 'center',
        marginBottom: '10px',
    },
    body: {
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
}

export default PNR;
