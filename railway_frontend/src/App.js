import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import Home from "./components/Home"
import NavBar from './components/NavBar';
import ForgotPassword from './components/ForgotPassword';
import LogOut from './components/LogOut';
import Search from './components/Search';
import Train from './components/Train';
import Passenger from './components/Passenger'
import Review from './components/Review';
import Payment from './components/Payment';
import Ticket from './components/Ticket';
import PNR from './components/Pnr';
import BookingList from './components/BookingList';
import Booking from './components/Booking';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const username = localStorage.getItem('username');
  return (
    <React.Fragment>
      <NavBar/>
      <Switch>
        <Route path="/home" component={Home}/>
        {!username && <Route path="/login" component={LoginScreen}/>}
        {!username && <Route path="/forgot-password" component={ForgotPassword}/>}
        {!username && <Route path="/register" component={RegisterScreen}/>}
        {username &&<Route path="/log-out" component={LogOut}/>}
        {username &&<Route path="/train/:startId-:endId/:day/:trainClass" component={Train}/>}
        {username &&<Route path="/train/:trainId/:trainClass" component={Passenger}/>}
        {username &&<Route path="/review/:trainId/" component={Review}/>}
        {username &&<Route path="/payment/" component={Payment}/>}
        {username &&<Route path="/ticket/" component={Ticket}/>}
        {username &&<Route path="/bookings/" component={BookingList}/>}
        {username &&<Route path="/booking/" component={Booking}/>}
        <Route path="/pnr/" component={PNR}/>
        <Route path="/search" component={Search}/>
        <Redirect to="/home"/>
      </Switch>
      <ToastContainer />
    </React.Fragment>
  );
}

export default App;