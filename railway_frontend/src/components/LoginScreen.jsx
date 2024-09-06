import React from 'react';
import Joi from 'joi-browser'
import Form from './Form';

class LoginScreen extends Form {
    username = React.createRef()
    password = React.createRef()
    state = { 
        data: {
            username:"",
            password:"",
        },
        errors:{}
    }
    schema = {
        username: Joi.string().min(5).required().label("username"),
        password: Joi.string().min(5).required().label("password"),
    }
    doSubmit = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/railways/users/${this.state.data.username}`);
            const userData = await response.json();
            if (userData.password === this.state.data.password) {
                localStorage.setItem('username', this.state.data.username);
                this.props.history.push('/search');
            } else {
                const errors = { ...this.state.errors };
                errors.username = "Invalid username or password";
                this.setState({ errors });
            }
        } catch (error) {
            const errors = { ...this.state.errors };
            errors.username = "An error occurred. Please try again later.";
            this.setState({ errors });
        }
    }
    render() {
        return (
            <div className='lrbg' style={{
                display: "flex",
                justifyContent: "flex-end",
            }}>
                <div className="form-div" style={{ marginRight:50, marginTop:60}}>
                    <h3 className='lr-head'>Log In</h3>
                    <form onSubmit={this.handleSubmit} style={{
                        width:"100%"
                    }}>
                        {this.renderInput("username", "UserName", 'input', 'text')}
                        {this.renderInput("password", "Password", 'input', "password",)}
                        {this.renderButton("Login")}
                    </form>
                    <p>Not a member already? <a href="/register">Sign Up</a></p>
                    <a href='/forgot-password'>Forgot Password?</a>
                </div>
            </div>
        );
    }
}

export default LoginScreen;