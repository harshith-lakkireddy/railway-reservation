import { Component } from 'react';

class LogOut extends Component {
    componentDidMount() {
        localStorage.removeItem('username');
        this.props.history.push('/home');
    }

    render() {
        return null;
    }
}

export default LogOut;
