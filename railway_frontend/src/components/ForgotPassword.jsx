import React from 'react';
import Form from "./Form";
import Joi from 'joi-browser'
import { toast } from 'react-toastify';

class ForgotPassword extends Form {
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
        const { data } = this.state;
        const { username, password } = data;
    
        try {
            const response = await fetch(`http://127.0.0.1:8000/railways/users/${username}/`);
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const userData = await response.json();
            userData.password = password;
            const putResponse = await fetch(`http://127.0.0.1:8000/railways/users/${username}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            if (!putResponse.ok) {
                throw new Error('Failed to update user data');
            }
            toast.success('Password reset successfully', {
                position: 'top-right',
                autoClose: 1500,
            });
            setTimeout(() => {
                this.props.history.push('/login');
            }, 2000);
        } catch (error) {
            toast.error('Failed to reset password', {
                position: 'top-right',
                autoClose: 1500,
            });
        }
    };
    
    
    render() {
        return (
            <div className='lrbg' style={{
                display: "flex",
                justifyContent: "flex-end",
            }}>
                <div className="form-div" style={{ marginRight:50, marginTop:60, paddingTop:50}}>
                    <form onSubmit={this.handleSubmit} style={{
                        width:"100%"
                    }}>
                        {this.renderInput("username", "UserName", 'input', 'text')}
                        {this.renderInput("password", "Enter New Password", 'input', "password",)}
                        {this.renderButton("Reset Password")}
                    </form>
                </div>
            </div>
        );
    }
}

export default ForgotPassword;
