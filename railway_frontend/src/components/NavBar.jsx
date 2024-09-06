import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import logo from "../images/logo.jpg"

class NavBar extends Component {
    render() {
        const username = localStorage.getItem('username');
        return (
            <nav className='nav'>
                <img src={logo} alt="Logo" className='nav-img'></img>
                <div style={{flexGrow:1}}></div>
                <ul style={{display:"flex"}}>
                <React.Fragment>
                        <div className='nav-link'><Link className='nav-link-text' to="/pnr" >PNR Status</Link></div>
                        {username ? null : (
                            <>
                                <div className='nav-link'><Link className='nav-link-text' to="/login" >Login</Link></div>
                                <div className='nav-link'><Link className='nav-link-text nav-link-border' to="/register">Register</Link></div>
                            </>
                        )}
                        {username && <div className='nav-link'><Link className='nav-link-text' to="/search" >Trains</Link></div>}
                        {username && <div className='nav-link'><Link className='nav-link-text' to="/bookings" >Bookings</Link></div>}
                        {username && <div className='nav-link'><Link className='nav-link-text nav-link-border' to="/log-out" >Log Out</Link></div>}
                    </React.Fragment>
                </ul>
            </nav>
        );
    }
}

export default NavBar;