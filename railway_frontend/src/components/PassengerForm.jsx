import React, { Component } from 'react';

class PassengerForm extends Component {
    state = {
        name: '',
        age: '',
        gender: 'male',
        birth_preference: this.props.trainClass === "2S" || this.props.trainClass === "CC" ? "window" : "lower",
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        const { name, age, gender, birth_preference } = this.state;
        const { ticket_id, seat_number, train_class, status, route } = this.props;
        const user = localStorage.getItem("username");
        const passenger = { name, age, gender, birth_preference, ticket_id, seat_number, user, train_class, status, route };
        this.props.onAddPassenger(passenger);
        this.setState({ name: '', age: '', gender: '', birth_preference: 'lower' });
    };

    render() {
        const { name, age, gender, birth_preference } = this.state;
        const { trainClass } = this.props;
        let birthPreferenceOptions = (
            <>
                <option value="upper">Upper</option>
                <option value="lower">Lower</option>
                <option value="middle">Middle</option>
            </>
        );
        if (trainClass === '2S' || trainClass === 'CC') {
            birthPreferenceOptions = (
                <>
                    <option value="window">Window</option>
                    <option value="middle">Middle</option>
                    <option value="aisle">Aisle</option>
                </>
            );
        }

        return (
            <form className="passenger-form" onSubmit={this.handleSubmit}>
                <label>
                    <input
                        type="text"
                        placeholder='Name'
                        name="name"
                        value={name}
                        onChange={this.handleInputChange}
                        required
                    />
                </label>
                <label>
                    <input
                        type="number"
                        placeholder='Age'
                        name="age"
                        value={age}
                        onChange={this.handleInputChange}
                        required
                    />
                </label>
                <label>
                    <select
                        name="gender"
                        value={gender}
                        onChange={this.handleInputChange}
                        required
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </label>
                <label>
                    <select
                        name="birth_preference"
                        value={birth_preference}
                        onChange={this.handleInputChange}
                    >
                        {birthPreferenceOptions}
                    </select>
                </label>
                <button type="submit" className='tab-btn' style={{marginLeft:'890px'}} >Add</button>
            </form>
        );
    }
}

export default PassengerForm;
