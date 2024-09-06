import React, { Component } from 'react';
import html2pdf from 'html2pdf.js';

class Ticket extends Component {
    state = {
        passengers: [],
        trainName: '',
        startStation: '',
        endStation: '',
        startTime: '',
        endTime: '',
        duration: '', 
        payment: {},
        filteredClass: {}
    };

    async componentDidMount() {
        const ticket_id = localStorage.getItem('ticket_id');
        if (!ticket_id) return;

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

    handlePrint = () => {
        const element = document.getElementById('ticket');
        const opt = {
            margin: 1,
            filename: 'eTicket.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
    
        html2pdf().from(element).set(opt).save();
    };

    render() {
        const { passengers, trainName, startStation, endStation, startTime, endTime, payment, filteredClass } = this.state;
        return (
            <div id='ticket' style={{...styles.flex, flexDirection:'column', alignItems:"center", paddingTop:'10px'}}>
                <h3 style={{ textDecoration: "underline" }}>Electronic Reservation Slip (ERS)</h3>
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
                <div style={styles.trainInfo}>
                    <h3 style={{ textDecoration: "underline" }}>Instructions </h3>
                    <ul style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
                        <li>Verify all ticket details including passenger names, train number, date, and boarding station before boarding.</li>
                        <li>Carry a valid government-issued photo ID (such as Aadhaar card, passport, voter ID, or PAN card) along with your ticket for verification.</li>
                        <li>Keep your ticket safe and secure throughout the journey for ticket inspections.</li>
                        <li>Adhere to prescribed luggage limits to avoid inconvenience and additional charges.</li>
                        <li>Do not carry inflammable, explosive, or dangerous goods as they pose a risk to safety.</li>
                        <li>Maintain cleanliness and hygiene in the train compartment and use designated waste bins.</li>
                        <li>Cooperate with railway staff for a safe and pleasant journey.</li>
                        <li>Do not board or alight from the train while it is in motion.</li>
                        <li>Follow instructions given by the train conductor and other officials for your safety.</li>
                        <li>Travel with a proper ticket and do not travel without a valid ticket.</li>
                        <li>Use emergency facilities only in case of genuine emergencies.</li>
                        <li>Do not engage in unauthorized soliciting or begging inside the train.</li>
                        <li>Respect fellow passengers' comfort and privacy during the journey.</li>
                        <li>Report any suspicious activities or unattended baggage to authorities immediately.</li>
                    </ul>
                </div>
                <div style={{...styles.trainInfo, borderBottom: '2px solid #000',}}>
                    <h4 style={{ textDecoration: "underline" }}>Customer Care </h4>
                    <ul>
                        <li>For e-ticket booking, cancellation, refund assistance please call us at 696969 (24 * 7 Hrs toll free) or mail us at anna_eyy@esko.com</li>
                        <li>For railway enquiry, please contact us at 69 (24 * 7 Hrs toll free) or SMS rail</li>
                        <li>For e-catering, to book and get food delivered on your train berth, please contact us at 6969 (24 * 7 Hrs toll free) or log on to errikuku@labb.com</li>
                    </ul>
                </div>
                <button className='tab-btn' style={{margin:'10px 0'}} onClick={this.handlePrint}>Print Ticket</button>
            </div>
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

export default Ticket;
