import React, { Component } from 'react';
import Search from './SearchBar';

class Train extends Component {
    state = {
        routes: [],
        trains: [],
        endTimes: [],
        selectedTrainIndex: null,
        trainClasses: [],
        selectedDate:null,
    };
    
    componentWillMount() {
        const { startId, endId, day, trainClass } = this.props.match.params;
        this.setState({selectedDate:new Date(localStorage.getItem("date"))})

        fetch(`http://127.0.0.1:8000/railways/routess/${startId}-${endId}/`)
    .then(response => response.json())
    .then(data => {
        const routes = data;
        const durations = data.map(route => route.duration);
        const trains = data.map(route => route.train);

        this.setState({ routes });

        Promise.all(trains.map(trainId =>
            fetch(`http://127.0.0.1:8000/railways/trains/${trainId}/`)
                .then(response => response.json())
        ))
            .then(trainData => {
                // Filter trains by day
                const filteredTrainsByDay = trainData.filter(train => train.runs.includes(day));
                if (trainClass === 'all') {
                    this.setState({ trains: filteredTrainsByDay });
                } else {
                    Promise.all(filteredTrainsByDay.map(train =>
                        fetch(`http://127.0.0.1:8000/railways/classes/${train.train_no}/`)
                            .then(response => response.json())
                            .then(classesData => ({
                                ...train,
                                classes: classesData
                            }))
                    ))
                        .then(updatedTrainData => {
                            const filteredTrainData = [];
                            updatedTrainData.forEach(train => {
                                if (train.classes.some(trainClassData => trainClassData.class_code === trainClass)) {
                                    filteredTrainData.push(train);
                                }
                            });
                            this.setState({ trains: filteredTrainData });
                        })
                        .catch(error => {
                            console.error('Error fetching train classes:', error);
                        });
                }

                filteredTrainsByDay.forEach((train, index) => {
                    this.calculateEndTime(train.start_time, durations[index], index);
                });
            })
            .catch(error => {
                console.error('Error fetching train data:', error);
            });
    })
    .catch(error => {
        console.error('Error fetching route data:', error);
    });

    }

    isDayAvailable = (day, runs) => {
        const dayMappings = {
            'm': 'monday',
            't': 'tuesday',
            'w': 'wednesday',
            'th': 'thursday',
            'f': 'friday',
            'sa': 'saturday',
            's': 'sunday'
        };
        const fullDay = dayMappings[day];
        return runs.includes(fullDay);
    }

    calculateEndTime = (startTime, duration, index) => {
        const [hours, minutes, seconds] = duration.split(':').map(Number);
        const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
        let totalSeconds = seconds + startSeconds;
        let totalMinutes = minutes + startMinutes;
        let totalHours = hours + startHours;

        if (totalSeconds >= 60) {
            totalSeconds -= 60;
            totalMinutes += 1;
        }
        if (totalMinutes >= 60) {
            totalMinutes -= 60;
            totalHours += 1;
        }

        let dayCount = 0;
        while (totalHours >= 24) {
            totalHours -= 24;
            dayCount++;
        }

        const endTime = `${dayCount > 0 ? `${dayCount} day(s) ` : ''}${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
        this.setState(prevState => {
            const updatedEndTimes = [...prevState.endTimes];
            updatedEndTimes[index] = endTime;
            return { endTimes: updatedEndTimes };
        }, () => {
        });
    }

    handleClickTrain = (index) => {
        if (this.state.selectedTrainIndex === index) {
            this.setState({ selectedTrainIndex: null, trainClasses: [] });
        } else {
            fetch(`http://127.0.0.1:8000/railways/classes/${this.state.trains[index].train_no}/`)
                .then(response => response.json())
                .then(data => {
                    this.setState({ selectedTrainIndex: index, trainClasses: data });
                })
                .catch(error => {
                    console.error('Error fetching train classes:', error);
                });
        }
    }
    
    render() {
        const { routes, trains, endTimes, selectedTrainIndex, trainClasses, selectedDate } = this.state;
        const { startId, endId, day, trainClass } = this.props.match.params;
        
        const daysOfWeek = ['m ', 't ', 'w ', 'th ', 'f ', 'sa ', 's '];
        const dayOfMonth = selectedDate.getDate();
        const monthIndex = selectedDate.getMonth();
        const year = selectedDate.getFullYear();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = months[monthIndex];
    
        return (
            <>
                <Search startId={startId} endId={endId} day={day} trainClass={trainClass} selectedDate={selectedDate} />
                <div style={styles.trainList}>
                    {routes.map((route, index) => {
                        const train = trains[index];
                        let endTime = endTimes[index];
                        let journeyDays = []
                        if (endTime) {
                            journeyDays = endTime.split(" ")
                        }
                        if (journeyDays.length === 3) {
                            journeyDays = parseInt(journeyDays[0])
                            endTime = endTime.split(" ")
                            endTime = endTime[2]
                        } else {
                            journeyDays = 0
                        }
                        if (!train) {
                            return null;
                        }
                        let runs = "all"
                        if (train.runs !== "all") {
                            runs = train.runs.split('-').map(day => day.trim());
                        }
                        localStorage.setItem(train.train_no, `${train.name} (${train.train_no})+Start Time: ${dayOfMonth} ${monthName} ${year} ${train.start_time}+End Time: ${dayOfMonth + journeyDays} ${monthName} ${year} ${endTime}+Duration: ${route.duration}`)
                        return (
                            <div key={index} style={styles.trainItem} onClick={() => this.handleClickTrain(index)}>
                                <div style={styles.trainInfo}>
                                    <div style={styles.header}>
                                        <h2>{train.name} ({train.train_no})</h2>
                                        <div>
                                            {runs !== "all" &&
                                                <p>Runs: {daysOfWeek.map((dayOfWeek, i) => (
                                                    <span key={i} style={{ fontWeight: runs.includes(dayOfWeek.trim()) ? 'bold' : 'normal' }}>{dayOfWeek.toUpperCase()}</span>
                                                ))}</p>
                                            }
                                            {runs === "all" && <p style={{ textAlign: 'center' }}>Runs: <strong>DAILY</strong></p>}
                                        </div>
                                    </div>
                                    <div style={styles.body}>
                                        <div>
                                            {train.start_time.slice(0, -3)} | {localStorage.getItem("origin")} | {dayOfMonth} {monthName} {year}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <p style={{ marginBottom: "30px" }}>_____</p><span style={{ margin: '0 10px' }}>{route.duration.slice(0, -3)}</span><p style={{ marginBottom: "30px" }}>_____</p>
                                        </div>
                                        <div>
                                            {endTime.slice(0, -3)} | {localStorage.getItem("destination")} | {dayOfMonth + journeyDays} {monthName} {year}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {selectedTrainIndex === index && (
                                        <div style={styles.classesContainer}>
                                            {trainClasses.map(trainClass => (
                                                <a key={trainClass.class_code} style={{color:"rgb(2, 43, 84)"}} href={`/train/${this.state.trains[selectedTrainIndex].train_no}/${trainClass.class_code}?fare=${trainClass.fare}`}>
                                                    <div key={trainClass.id} style={styles.classItem}>
                                                        <p>{trainClass.class_name} ({trainClass.class_code})</p>
                                                        <p>Fare: {trainClass.fare}</p>
                                                        {trainClass.class_code === "2S" && <p><strong style={{ color: "green" }}>AVAILABLE - </strong>{trains[selectedTrainIndex].no_unreserved}</p>}
                                                        {trainClass.class_code === "SL" && <p><strong style={{ color: "green" }}>AVAILABLE - </strong>{trains[selectedTrainIndex].no_sleeper}</p>}
                                                        {trainClass.class_code === "CC" && <p><strong style={{ color: "green" }}>AVAILABLE - </strong>{trains[selectedTrainIndex].no_chair_car}</p>}
                                                        {trainClass.class_code === "3A" && <p><strong style={{ color: "green" }}>AVAILABLE - </strong>{trains[selectedTrainIndex].no_3ac}</p>}
                                                        {trainClass.class_code === "2A" && <p><strong style={{ color: "green" }}>AVAILABLE - </strong>{trains[selectedTrainIndex].no_2ac}</p>}
                                                        {trainClass.class_code === "1A" && <p><strong style={{ color: "green" }}>AVAILABLE - </strong>{trains[selectedTrainIndex].no_1ac}</p>}
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {trains.length === 0 && <p>No trains available</p>}
                </div>
            </>

        );
    }
    
        
}

const styles = {
    trainList: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '20px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    },
    trainItem: {
        margin: "10px 30px 10px 30px",
        padding: '20px',
        width: '90%',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection:"column",
        alignItems: 'center',
        cursor: 'pointer',
    },
    trainInfo: {
        border: '1px solid #ddd',
        borderRadius: '5px',
        padding: '10px',
        marginBottom: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
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
    classesContainer: {
        width: '50%',
        display: 'flex',
        alignItems: 'center',
    },
    classItem: {
        border: '1.5px solid gray', 
        padding: '10px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '5px',
        fontSize:13,
        fontWeight:"bold",
        width:'150px',
        height:"85px",
        marginLeft:"5px"
    },
};

export default Train;
