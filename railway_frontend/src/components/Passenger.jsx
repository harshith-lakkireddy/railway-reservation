import React, { Component } from 'react';
import PassengerForm from './PassengerForm';
import { toast } from 'react-toastify';
import Progress from './Progress';

class Passenger extends Component {
    state = {
        passengers: [],
        showForm: false,
        ticket_id: Math.floor(1000000000 + Math.random() * 9000000000),
        seat_number: 1,
        userDetails: {},
        isPaymentModeSelected: false,
        trainData:{}
    };

    componentDidMount() {
        const username = localStorage.getItem("username");
        fetch(`http://127.0.0.1:8000/railways/users/${username}`)
            .then(response => response.json())
            .then(userDetails => {
                this.setState({ userDetails });
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
            });

        const { trainId, trainClass } = this.props.match.params;
        localStorage.setItem("ticket", this.state.ticket_id)
        fetch(`http://127.0.0.1:8000/railways/trains/${trainId}/`)
            .then(response => response.json())
            .then(trainData => {
                this.setState({trainData})
                let seat_number;
                switch (trainClass) {
                    case "2S":
                        seat_number = trainData.no_unreserved;
                        break;
                    case "SL":
                        seat_number = trainData.no_sleeper;
                        break;
                    case "CC":
                        seat_number = trainData.no_chair_car;
                        break;
                    case "3A":
                        seat_number = trainData.no_3ac;
                        break;
                    case "2A":
                        seat_number = trainData.no_2ac;
                        break;
                    case "1A":
                        seat_number = trainData.no_1ac;
                        break;
                    default:
                        seat_number = 1;
                }
                this.setState({ seat_number });
            })
            .catch(error => {
                console.error('Error fetching train data:', error);
            });
    }
    
    handleAddPassenger = (passenger) => {
        const { passengers, seat_number } = this.state;
        passengers.push(passenger);
        this.setState({ passengers, seat_number: seat_number - 1, showForm: false });
    };

    toggleForm = () => {
        this.setState((prevState) => ({ showForm: !prevState.showForm }));
    };

    handlePaymentModeSelection = () => {
        this.setState((prevState) => ({ isPaymentModeSelected: !prevState.isPaymentModeSelected }));
    };

    handleContinue = () => {
        const { passengers, ticket_id, isPaymentModeSelected } = this.state;
    
        if (passengers.length === 0) {
            toast.error('add passengers', {
                position: 'top-right',
                autoClose: 1500,
            });
            return;
        }
    
        const postPassenger = (passenger) => {
            fetch(`http://127.0.0.1:8000/railways/passengers/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passenger),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add passenger');
                }
                return response.json();
            })
            .then(data => {
            })
            .catch(error => {
                console.error('Error adding passenger:', error);
            });
        };
    
        passengers.forEach(passenger => {
            postPassenger(passenger);
        });
    
        const { trainClass } = this.props.match.params;
        const { trainData } = this.state;
    
        switch (trainClass) {
            case "2S":
                trainData.no_unreserved -= passengers.length;
                break;
            case "SL":
                trainData.no_sleeper -= passengers.length;
                break;
            case "CC":
                trainData.no_chair_car -= passengers.length;
                break;
            case "3A":
                trainData.no_3ac -= passengers.length;
                break;
            case "2A":
                trainData.no_2ac -= passengers.length;
                break;
            case "1A":
                trainData.no_1ac -= passengers.length;
                break;
            default:
                break;
        }
    
        fetch(`http://127.0.0.1:8000/railways/trains/${trainData.train_no}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trainData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update train data');
            }
            return response.json();
        })
        .then(data => {
        })
        .catch(error => {
            console.error('Error updating train data:', error);
        });

        const convenienceFee = isPaymentModeSelected ? 30 : 20;
        localStorage.setItem('convenienceFee', convenienceFee);

        const classes = {
            "1A": "First Class AC",
            "2A": "Second Class AC",
            "3A": "Third Class AC",
            "SL": "Sleeper Class",
            "CC": "Chair Car",
            "2S": "Second Sitting",
            "GEN": "General"
        }
        localStorage.setItem('ticket_id', ticket_id);
        localStorage.setItem('class', `${classes[trainClass]} (${trainClass})`);
        const urlParams = new URLSearchParams(window.location.search);
        const fare = parseFloat(urlParams.get('fare')) || 0;
        const adults = passengers.filter(p => p.age > 15)
        const thisTrainData = localStorage.getItem(this.props.match.params.trainId).split("+")
        const thisDate = localStorage.getItem("date").split(" ")
        const start = thisTrainData[1].split(" ")
        localStorage.setItem("boarding", `${adults.length === 0 ? 0 : adults.length} ${adults.length > 1 ? 'Adults':'Adult'} | ${passengers.length - adults.length === 0 ? 0 : passengers.length - adults.length} ${passengers.length - adults.length > 1 ? 'Children':'Child'} | ${localStorage.getItem("class")} | Boarding at ${localStorage.getItem("origin")} | Boarding Date: ${thisDate[0]} ${thisDate[1]} ${thisDate[2]} ${start[start.length - 1].split(":")[0]}:${start[start.length - 1].split(":")[1]}`)
        this.props.history.push(`/review/${trainData.train_no}?totalfare=${passengers.length * fare}`);
    };
    
     addMinutes = (timeString, minutesToAdd) => {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        let totalMinutes = hours * 60 + minutes + minutesToAdd;
        let newHours = Math.floor(totalMinutes / 60) % 24;
        let newMinutes = totalMinutes % 60;
        return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

     maskEmailOrPhoneNumber = (input) => {
        if (/^\d{10}$/.test(input)) {
            return `${input.slice(0, 2)}${'*'.repeat(input.length - 4)}${input.slice(-2)}`;
        } else if (/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(input)) { 
            let [username, domain] = input.split('@');
            return `${username.slice(0, 2)}${'*'.repeat(username.length - 4)}@${domain}`;
        } else if (/^\w+@[a-zA-Z_]+?\.edu\.[a-zA-Z]{2,3}$/.test(input)) {
            let [username, domain] = input.split('@');
            return `${username.slice(0, 2)}${'*'.repeat(username.length - 4)}@${domain}`;
        } else {
            return "Invalid input";
        }
    }

    render() {
        const { showForm, passengers, ticket_id, seat_number, userDetails, isPaymentModeSelected } = this.state;
        const { trainId, trainClass } = this.props.match.params;
        const urlParams = new URLSearchParams(window.location.search);
        const farePerPassenger = parseFloat(urlParams.get('fare')) || 0;
        const totalFare = passengers.length * farePerPassenger;
        let timesStr = localStorage.getItem(trainId)
        let times = timesStr.split("+")
        let origin = times[1].split(" ")
        let arrival = origin[origin.length - 1].slice(0, -3)
        localStorage.setItem("contact", `Your Ticket will be sent to ${this.maskEmailOrPhoneNumber(userDetails.email)} and ${this.maskEmailOrPhoneNumber(userDetails.phone)}`)
        return (
            <>
        <Progress step={1}/>
            <div className="content-wrapper" style={styles.contentWrapper}>
    <div className="left-column" style={styles.leftColumn}>
        <div>
            <div style={styles.trainInfo}>
                <div style={styles.header}>
                    <h2>{times[0]}</h2>
                </div>
                <div style={styles.body}>
                    <div>{localStorage.getItem("origin") + ' |'}{times[1].slice(0, -3).split("Start Time:")[1]}</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p style={{ marginBottom: "30px" }}>_____</p>
                        <span style={{ margin: '0 10px' }}>{times[3].slice(0, -3).split("Duration:")[1]}</span>
                        <p style={{ marginBottom: "30px" }}>_____</p>
                    </div>
                    <div>{times[2].slice(0, -3).split("End Time:")[1]}{' | ' + localStorage.getItem("destination")}</div>
                </div>
                <div style={styles.flex}>
                    Boarding Station | {localStorage.getItem("origin")} | Arrival: {arrival} | Departure{' '}
                    {localStorage.getItem("junction") === 'true'
                        ? this.addMinutes(origin[origin.length - 1], 10)
                        : this.addMinutes(origin[origin.length - 1], 2)} | Boarding Date: {origin[2] + " " + origin[3] + " " + origin[4]}
                </div>
            </div>
        </div>
        {passengers.length > 0 && (
            <div style={{ marginTop: '20px', marginLeft:"22px" }}>
                <h2 style={{ marginBottom: '10px', fontSize: '1.2em', color: '#333' }}>Passengers:</h2>
                <ul style={{ listStyleType: 'none', padding: '0' }}>
                    {passengers.map((passenger, index) => (
                        <li key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ marginTop: '0'}}>Name: <i>{passenger.name}</i>{" , "} Age: <i>{passenger.age}</i>{" , "} Gender: <i>{passenger.gender}</i></p>
                                </div>
                                <button className='tab-btn'>Remove</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {showForm && <PassengerForm 
                        train_class={trainClass} 
                        ticket_id={ticket_id} 
                        seat_number={seat_number} 
                        status="CNF" 
                        onAddPassenger={this.handleAddPassenger} 
                        route={localStorage.getItem("origin") + "+" + localStorage.getItem("destination") + "+" + localStorage.getItem(trainId)  }
                    />}
        {!showForm && <button style={styles.add} onClick={this.toggleForm}>+Add Passenger / Add infant with berth</button>}
        {userDetails.email && userDetails.phone && (
    <div className="contact-details">
        <h3 style={{ fontSize: '1em', fontWeight: 'bold', marginBottom: '1em' }}>Contact Details</h3>
        <p style={{ fontSize: '1em', marginBottom: '0.5em' }}>
            Ticket details will be sent to email - <span style={{ fontWeight: 'bold' }}>{userDetails.email}</span> and registered mobile number <span style={{ fontWeight: 'bold' }}>{userDetails.phone}</span>
        </p>
        <input type="text" defaultValue={userDetails.phone} style={{ fontSize: '0.9em' }} />
    </div>
)}

        <div className="payment-mode-options">
            <h3>Payment Mode</h3>
            <div>
            <label style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginTop:"12px" }}>
                    <input
                        id="paymentModeToggle"
                        type="checkbox"
                        style={{ display: 'none' }}
                        checked={isPaymentModeSelected}
                        onChange={this.handlePaymentModeSelection}
                    />
                    <label htmlFor="paymentModeToggle" style={{ position: 'relative', display: 'inline-block', width: '15px', height: '15px', borderRadius: '50%', border: '2px solid orange', marginRight: '5px', cursor: 'pointer' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'orange', display: `${isPaymentModeSelected ? 'block' : 'none'}` }}></div>
                    </label>
                </div>
                Pay through Credit & Debit Cards / Net Banking / Wallets / Bharat QR / Pay on Delivery/ Rewards and Others
            </label>
                <p style={{marginLeft:"22px"}}>Convenience Fee: ₹30/- + GST</p>
            </div>
            <div>
            <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                    id="paymentModeToggle"
                    type="checkbox"
                    style={{ display: 'none' }}
                    checked={!isPaymentModeSelected}
                    onChange={this.handlePaymentModeSelection}
                />
                <span style={{ position: 'relative', display: 'inline-block', width: '15px', height: '15px', borderRadius: '50%', border: '2px solid orange', marginRight: '5px', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'orange', display: `${!isPaymentModeSelected ? 'block' : 'none'}` }}></div>
                </span>
                Pay through BHIM/UPI
            </label>
                <p style={{marginLeft:"22px"}}>Convenience Fee: ₹20/- + GST</p>
            </div>
        </div>
        <button className='tab-btn' style={{margin:10, marginLeft:22}} onClick={() => this.props.history.goBack()}>Back</button>
        <button className='tab-btn' style={{margin:10}} onClick={this.handleContinue} >Continue</button>
    </div>
    <div className="right-column" style={styles.rightColumn}>
    <div className="fare-summary">
    <div className="fare-heading">Fare Summary</div>
        <p className='fare-text'><strong>Ticket Fare:</strong>  Rs.{farePerPassenger}.00</p>
        <p className='fare-text'><strong>Total fare:</strong> Rs. {totalFare}.00</p>
    </div>
    </div>
</div>
</>
)}
    }

const styles = {
    add:{
        border:0,
        backgroundColor:"#fff",
        fontSize:'1rem',
        color:"dodgerblue",
        margin:"20px",
        cursor:"pointer"
    },
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
export default Passenger;
