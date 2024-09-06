import React, { Component } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaExchangeAlt, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

class Search extends Component {
    state = {
        origin: null,
        destination: null,
        trainClass: null,
        stations: [],
        selectedDate: new Date(),
        trainClasses: [],
        day:null,
        startStation: {},
        endStation: {},
    }

    async componentDidMount() {
        const { startId, endId, day, trainClass, selectedDate } = this.props;
        let startStation = {}
        let endStation = {}
        await fetch('http://127.0.0.1:8000/railways/stations/')
        .then(response => response.json())
        .then(data => {
            startStation = data.find(station => station.city_code === startId);
            endStation = data.find(station => station.city_code === endId);
            const options = data.map(station => ({
                value: station.city_code,
                label: station.city
            }));
            this.setState({ stations: options, startStation});
        })
        .catch(error => {
            console.error('Error fetching stations:', error);
        });
        let myClass = {
            class_name: "ALL CLASSES",
            class_code: "all",
        }
        await fetch('http://127.0.0.1:8000/railways/train-classes/')
        .then(response => response.json())
            .then(data => {
                if(trainClass !== "all"){
                    myClass = data.find(clas => clas.class_code === trainClass)
                }
                const uniqueClasses = Array.from(new Set(data.map(item => item.class_code))).map(class_code => {
                    const { class_name } = data.find(item => item.class_code === class_code);
                    return { value: class_code, label: class_name };
                });
                this.setState({ trainClasses: [{value:'all', label:"ALL CLASSES"}, ...uniqueClasses] });
            })
            .catch(error => {
                console.error('Error fetching train classes:', error);
            });
            this.setState({ origin: {"value":startId, "label":startStation.city}, destination: {"value":endId, "label":endStation.city}, trainClass: {"value": trainClass, "label":myClass.class_name}, day: day, selectedDate:selectedDate });
    }

    swapStations = () => {
        const { origin, destination } = this.state;
        this.setState({ origin: destination, destination: origin });
    }

    getDayAbbreviation = () => {
        const dayName = this.state.selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dayMap = {
            'monday': 'm',
            'tuesday': 't',
            'wednesday': 'w',
            'thursday': 'th',
            'friday': 'f',
            'saturday': 'sa',
            'sunday': 's'
        };
        return dayMap[dayName];
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const dayAbbreviation = this.getDayAbbreviation();
        const { origin, destination, trainClass } = this.state;
        const from = origin ? origin.value : '';
        const to = destination ? destination.value : '';
        let classy = trainClass ? trainClass.value : '';
        if(classy === ''){
            classy = 'all'
        }
        if (!origin && !destination) {
            toast.error('Please select both Start and destination Stations', {autoClose:1500});
            return;
        }
        if (!origin) {
            toast.error('Please select Start Station', {autoClose:1500});
            return;
        }
        if (!destination) {
            toast.error('Please select destination. Station', {autoClose:1500});
            return;
        }
        localStorage.setItem("junction", this.state.startStation.junction)
        localStorage.setItem("origin", this.state.origin.label)
        localStorage.setItem("destination", this.state.destination.label)
        localStorage.setItem("date", this.state.selectedDate)
        window.location = `/train/${from}-${to}/${dayAbbreviation}/${classy}`  
    }

    render() {
        return (
            <div style={styles.searchContainer}>
    <form onSubmit={this.handleSubmit} style={styles.searchForm}>
        <div style={styles.formGroup}>
            <div style={styles.inputContainer}>
                <Select
                    key={this.state.origin ? this.state.origin.value : 'from'}
                    options={this.state.stations}
                    value={this.state.origin}
                    onChange={selectedOption => this.setState({ origin: selectedOption })}
                    placeholder="From"
                    style={styles.select}
                />
            </div>
            <FaExchangeAlt style={styles.swapStationsIcon} onClick={this.swapStations} />
            <div style={styles.inputContainer}>
                <Select
                    key={this.state.destination ? this.state.destination.value : 'to'}
                    options={this.state.stations}
                    value={this.state.destination}
                    onChange={selectedOption => this.setState({ destination: selectedOption })}
                    placeholder="To"
                    style={styles.select}
                />
            </div>
        </div>
        <div style={styles.formGroup}>
            <div style={styles.inputContainer}>
                <div style={styles.datePicker}>
                    <FaCalendarAlt style={styles.calendarIcon} />
                    <DatePicker
                        selected={this.state.selectedDate}
                        onChange={date => this.setState({ selectedDate: date })}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select date"
                        minDate={new Date()}
                        customInput={
                            <input
                                style={styles.formControl}
                                readOnly
                                value={this.state.selectedDate ? this.state.selectedDate.toLocaleDateString('en-GB') : ''}
                            />
                        }
                    />
                </div>
            </div>
            <div style={styles.inputContainer}>
                <Select
                    options={this.state.trainClasses}
                    value={this.state.trainClass}
                    onChange={selectedOption => this.setState({ trainClass: selectedOption })}
                    placeholder="Select train class"
                    style={styles.select}
                />
            </div>
        </div>
        <button style={styles.button} type="submit">Modify Search</button>
    </form>
</div>

        );
    }
    
}

const styles = {
    searchContainer: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        padding: '20px 0',
    },
    searchForm: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '600px',
        width: '100%',
    },
    formGroup: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        width: '100%',
    },
    inputContainer: {
        width: 'calc(60% - 10px)', // Adjust based on the number of fields in a row and margins
    },
    formControl: {
        padding: '8px 10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '3px',
        width: '100%',
        boxSizing: 'border-box',
    },
    swapStationsIcon:{
        fontSize: '23px',
        margin:'3px'
    },
    datePicker: {
        position: 'relative',
    },
    calendarIcon: {
        position:"relative",
        top:"5px",
        fontSize: '23px',
        cursor: 'pointer',
    },
    button: {
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        width: '100%',
    },
};

export default Search;