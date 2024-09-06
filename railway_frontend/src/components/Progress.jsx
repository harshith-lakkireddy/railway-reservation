import React, { Component } from 'react';

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    stepContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: '50%',
        marginTop:"50px",
        border: '1px solid #333',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    lineContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    line: {
        width: 100,
        height: 2,
        backgroundColor: '#333',
        margin: '0 15px'
    }
};

class Progress extends Component {
    render() {
        const { step } = this.props;
        return (
            <div style={styles.container}>
                <div style={styles.stepContainer}>
                    <div style={{ ...styles.circle, backgroundColor: step >= 1 ? 'gold' : 'transparent' }}>1</div>
                    <p>Passenger details</p>
                </div>
                <div style={styles.lineContainer}>
                    <div style={{ ...styles.line, backgroundColor: step >= 2 ? 'gold' : '#333' }}></div>
                </div>
                <div style={styles.stepContainer}>
                    <div style={{ ...styles.circle, backgroundColor: step >= 2 ? 'gold' : 'transparent' }}>2</div>
                    <p>Review journey</p>
                </div>
                <div style={styles.lineContainer}>
                    <div style={{ ...styles.line, backgroundColor: step >= 3 ? 'gold' : '#333' }}></div>
                </div>
                <div style={styles.stepContainer}>
                    <div style={{ ...styles.circle, backgroundColor: step >= 3 ? 'gold' : 'transparent' }}>3</div>
                    <p>Payment</p>
                </div>
            </div>
        );
    }
}

export default Progress;
