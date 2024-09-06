import React from 'react';
import Joi from 'joi-browser';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { toast } from 'react-toastify';
import 'react-tabs/style/react-tabs.css';

import Form from './Form';

class RegisterScreen extends Form {
  state = {
    //basic
    data1:{
      username: "",
      password: "",
    },
    //personal
    data2:{
      first_name: "",
      last_name: "",
      age: "",
      gender: "",
      marital_stat: "",
      country: "",
      email: "",
      phone: "",
    },
    data: {
      //basic
      username: "",
      password: "",
      //personal
      first_name: "",
      last_name: "",
      age: "",
      gender: "",
      marital_stat: "",
      country: "",
      email: "",
      phone: "",
      //address
      flat_no:"",
      street:"",
      locality:"",
      pincode:"",
      city:"",
      state:"",
    },
    errors: {},
    currentTab: 0
  }

  schema = {
    //basic
    username: Joi.string().min(5).required().label("Username"),
    password: Joi.string().min(5).required().label("Password"),
    //personal
    first_name: Joi.string().required().label("FirstName"),
    last_name: Joi.string().required().label("LastName"),
    age: Joi.number().min(18).max(100).required().label("Age"),
    gender: Joi.string().required().max(10).label("Gender"),
    marital_stat: Joi.string().required().label("Marital Status"),
    country: Joi.string().required().label("Country"),
    email: Joi.string().email().required().label("Email"),
    phone: Joi.string().min(10).max(10).required().label("Phone"),

    //address
    flat_no:Joi.string().required().label("Flat No"),
    street:Joi.string().required().label("Street"),
    locality:Joi.string().required().label("Locality"),
    pincode:Joi.number().min(6).required().label("pincode"),
    city:Joi.string().required().label("City"),
    state:Joi.string().required().label("State"),
  }

  handleNext = () => {
    const { currentTab } = this.state;
    if (currentTab === 0){
      const data1 = { ...this.state.data1 };
      const inputs = Array.from(document.getElementsByTagName('input'));
    
      inputs.forEach(input => {
        if (input.name in data1) {
          data1[input.name] = input.value;
        }
      });
      this.setState({ data1 });
      const nextTab = currentTab + 1;
      this.setState({ currentTab: nextTab });
    }
    if (currentTab === 1){
      const data2 = { ...this.state.data2 };
      const inputs = Array.from(document.getElementsByTagName('input'));
    
      inputs.forEach(input => {
        if (input.name in data2) {
          data2[input.name] = input.value;
        }
      });
      this.setState({ data2 });
      const nextTab = currentTab + 1;
      this.setState({ currentTab: nextTab });
    }
  }  

  handlePrev = () => {
    const currentTab = this.state.currentTab - 1;
    this.setState({ currentTab });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const data1 = { ...this.state.data1 };
    const data2 = { ...this.state.data2 };
    const data = { ...this.state.data };
    data.username = data1.username;
    data.password = data1.password;
    data.first_name = data2.first_name
    data.last_name = data2.last_name
    data.age = data2.age
    data.gender = data2.gender
    data.marital_stat = data2.marital_stat
    data.country = data2.country
    data.email = data2.email
    data.phone = data2.phone
    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (!errors) {
      fetch('http://127.0.0.1:8000/railways/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.errors) {
          this.setState({errors:data.errors})
          for (const key in data.errors) {
            toast.error(data.errors[key], { autoClose: 3000 });
          }
        } else {
          localStorage.setItem('username', data.username);
          this.props.history.push('/search');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  }

  renderButtons() {
    const { currentTab } = this.state;
    if (currentTab === 0) {
      return (
        <>
          <button className='tab-btn'><a href="/login" >Cancel</a></button>
          <button className='tab-btn' onClick={this.handleNext}>Next</button>
        </>
      );
    } else if (currentTab === 2) {
      return (
      <>
      <button className='tab-btn' onClick={this.handlePrev}>Back</button>
      <button className='tab-btn' onClick={this.handleSubmit}>Register</button>
      </>
      )
    } else {
      return (
        <>
          <button className='tab-btn' onClick={this.handlePrev}>Back</button>
          <button className='tab-btn' onClick={this.handleNext}>Next</button>
        </>
      );
    }
  }

  render() {
    const { currentTab } = this.state;

    return (
      <div className="lrbg">
          <Tabs selectedIndex={currentTab} onSelect={tabIndex => this.setState({ currentTab: tabIndex })} 
          style={{  
            width: "80%", 
            height:"90vh", 
            backgroundColor:"#fff",
            borderRadius:"9px",
            marginLeft:20, 
            paddingTop:10,
            paddingLeft:10}}>
            <TabList>
              <Tab>Basic Details</Tab>
              <Tab>Personal Details</Tab>
              <Tab>Address</Tab>
            </TabList>
            <TabPanel>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <h3 className='lr-head'>Sign Up</h3>
              </div>
              <form onSubmit={this.handleSubmit} style={{ width: "100%" }}>
                {this.renderInput('username', 'UserName')}
                {this.renderInput('password', 'Password', 'input', 'password')}
                <div style={{ display: 'flex', justifyContent: 'space-around',  paddingTop:"20px"}}>
                {this.renderButtons()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop:"15px" }}>
              <p>already a member? <a href="/login">Log In</a></p>
              </div>
              </form>
            </TabPanel>
            <TabPanel>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <h3 className='lr-head'>Sign Up</h3>
              </div>
              <form onSubmit={this.handleSubmit} style={{ width: "100%" }}>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {this.renderInput('first_name', 'First Name')}
                  {this.renderInput('last_name', 'Last Name')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {this.renderInput('age', 'Age')}
                  {this.renderInput('gender', 'Gender')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {this.renderInput('marital_stat', 'Marital Status')}
                  {this.renderInput('country', 'Country')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {this.renderInput('email', 'Email', 'input', 'email')}
                  {this.renderInput('phone', 'Phone')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop:"30px" }}>
                {this.renderButtons()}
              </div>
              
              </form>
            </TabPanel>
            <TabPanel>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <h3 className='lr-head'>Sign Up</h3>
              </div>
              <form onSubmit={this.handleSubmit} style={{ width: "100%" }}>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {this.renderInput('flat_no', 'Flat Number')}
                  {this.renderInput('street', 'Street')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {this.renderInput('locality', 'Locality')}
                  {this.renderInput('pincode', 'Pincode')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {this.renderInput('city', 'City')}
                  {this.renderInput('state', 'State')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop:"30px" }}>
                {this.renderButtons()}
              </div>
              
              </form>
            </TabPanel>
          </Tabs>
      </div>
    );
  }
}

export default RegisterScreen;
