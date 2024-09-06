import React, { Component } from 'react';
import Progress from "./Progress";
import { toast } from 'react-toastify';

class Payment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMethod: 'card',
            upiId: '',
            cardNumber: '',
            cvv: '',
            cardName: '',
            netbankingDetails: {
                bankName: '',
                accountNumber: '',
                ifscCode: ''
            },
            emiDetails: {
                months: '',
                interestRate: ''
            },
        };
    }

    handleMethodSelect = (method) => {
        this.setState({ selectedMethod: method });
    };

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    handleNetbankingChange = (event) => {
        const { name, value } = event.target;
        this.setState((prevState) => ({
            ...prevState,
            netbankingDetails: {
                ...prevState.netbankingDetails,
                [name]: value
            }
        }));
    };

    handleEmiChange = (event) => {
        const { name, value } = event.target;
        this.setState((prevState) => ({
            ...prevState,
            emiDetails: {
                ...prevState.emiDetails,
                [name]: value
            }
        }));
    };

    handlePayClick = () => {
        const { selectedMethod, upiId, cardNumber, cvv, cardName, netbankingDetails, emiDetails } = this.state;

        if ((selectedMethod === 'upi' && !upiId) ||
            (selectedMethod === 'card' && (!cardNumber || !cvv || !cardName)) ||
            (selectedMethod === 'netbanking' && (!netbankingDetails.bankName || !netbankingDetails.accountNumber || !netbankingDetails.ifscCode)) ||
            (selectedMethod === 'emi' && (!emiDetails.months || !emiDetails.interestRate))) {
                toast.error('Fill all required fields', {
                    position: 'top-right',
                    autoClose: 1500,
                })
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const farePerPassenger = parseFloat(urlParams.get('fare')) || 0;
            fetch('http://127.0.0.1:8000/railways/payments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ticket_id: localStorage.getItem("ticket_id"),
                    amount: farePerPassenger - parseInt(localStorage.getItem("convenienceFee")), 
                    convenienceFee: localStorage.getItem("convenienceFee"),
                    status: 'success',
                    user: localStorage.getItem("username")
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit payment');
                }
                return response.json();
            })
            .then(data => {
                toast.success('Payment successful', {
                    position: 'top-right',
                    autoClose: 1500,
                });
                this.props.history.push("/ticket")
            })
            .catch(error => {
                console.error('Error:', error);
                toast.error('Failed to submit payment', {
                    position: 'top-right',
                    autoClose: 1500,
                });
            });
        }
    };

    renderForm = () => {
        const { selectedMethod } = this.state;
    
        switch(selectedMethod) {
            case 'upi':
                return (
                    <div className="form-group" style={styles.formGroup}>
                        <input type="text" placeholder='UPI ID' name="upiId" value={this.state.upiId} onChange={this.handleInputChange} style={styles.input} />
                    </div>
                );
            case 'card':
                return (
                    <div className="form-group" style={styles.formGroup}>
                        <input type="text" placeholder="Card Number" name="cardNumber" value={this.state.cardNumber} onChange={this.handleInputChange} style={styles.input} />
                        <input type="text" placeholder="CVV" name="cvv" value={this.state.cvv} onChange={this.handleInputChange} style={styles.input} />
                        <input type="text" placeholder="Name on Card" name="cardName" value={this.state.cardName} onChange={this.handleInputChange} style={styles.input} />
                    </div>
                );
            case 'netbanking':
                return (
                    <div className="form-group" style={styles.formGroup}>
                        <input type="text" placeholder="Bank Name" name="bankName" value={this.state.netbankingDetails.bankName} onChange={this.handleNetbankingChange} style={styles.input} />
                        <input type="text" placeholder="Account Number" name="accountNumber" value={this.state.netbankingDetails.accountNumber} onChange={this.handleNetbankingChange} style={styles.input} />
                        <input type="text" placeholder="IFSC Code" name="ifscCode" value={this.state.netbankingDetails.ifscCode} onChange={this.handleNetbankingChange} style={styles.input} />
                    </div>
                );
            case 'emi':
                return (
                    <div className="form-group" style={styles.formGroup}>
                        <input type="text" placeholder="Months" name="months" value={this.state.emiDetails.months} onChange={this.handleEmiChange} style={styles.input} />
                        <input type="text" placeholder="Interest Rate" name="interestRate" value={this.state.emiDetails.interestRate} onChange={this.handleEmiChange} style={styles.input} />
                    </div>
                );
            default:
                return null;
        }
    };
    

    render() {
        return (
            <div>
                <Progress step={3}/>
                <div className="payment-container">
                    <div className="sidebar">
                        <h2>Select Payment Method:</h2>
                        <ul className="payment-list">
                            <li className={this.state.selectedMethod === 'upi' ? 'selected' : ''} onClick={() => this.handleMethodSelect('upi')}>UPI</li>
                            <li className={this.state.selectedMethod === 'card' ? 'selected' : ''} onClick={() => this.handleMethodSelect('card')}>Credit/Debit Card</li>
                            <li className={this.state.selectedMethod === 'netbanking' ? 'selected' : ''} onClick={() => this.handleMethodSelect('netbanking')}>Netbanking</li>
                            <li className={this.state.selectedMethod === 'emi' ? 'selected' : ''} onClick={() => this.handleMethodSelect('emi')}>EMI</li>
                        </ul>
                    </div>
                    <div className="content">
                        {this.renderForm()}
                        <button className='tab-btn-payment' onClick={this.handlePayClick}>Pay</button>
                    </div>
                </div>
            </div>
        );
    }
}

const styles = {
    formGroup: {
        marginBottom: '20px',
        display:"flex",
        flexDirection:"column",
        alignItems:"start",
        marginLeft:"150px"
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontSize: '14px',
    },
    input: {
        width: '50%',
        padding: '8px',
        fontSize: '14px',
        marginBottom: '10px',
        boxSizing: 'border-box',
    },
};

export default Payment;
