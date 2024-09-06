import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';
import { createCanvas } from 'canvas';
import { toast } from 'react-toastify';

class Captcha extends Component {
  constructor(props) {
    super(props);
    this.state = {
      captcha: '',
      inputValue: '',
      isValid: false
    };
  }

  componentDidMount() {
    this.setState({ captcha: this.generateCaptcha() });
  }

  generateCaptcha = () => {
    const charsArray = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let length = 6;
    let captcha = '';
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * charsArray.length);
      captcha += charsArray[index];
    }
    return captcha;
  };

  handleInputChange = (event) => {
    this.setState({ inputValue: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { inputValue, captcha } = this.state;
    this.setState({ isValid: inputValue === captcha }, () => {
      if (this.state.isValid) {
        window.location = `/payment?fare=${this.props.totalFare}`;
      }else{
        inputValue === "" ? toast.error('Please Enter Captcha', {
          position: 'top-right',
          autoClose: 1500,
      }) : toast.error('Invalid Captcha', {
                position: 'top-right',
                autoClose: 1500,
            });
      }
    });
  };
  

  generateCaptchaImage = () => {
    const canvas = createCanvas(100, 40);
    const ctx = canvas.getContext('2d');
    ctx.font = '20px Arial';
    ctx.fillText(this.state.captcha, 10, 25);
    return canvas.toDataURL();
  };

  generateNewCaptcha = () => {
    this.setState({ captcha: this.generateCaptcha(), inputValue: '', isValid: false });
  };

  render() {
    const { inputValue } = this.state;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '50px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={this.generateCaptchaImage()} alt="Captcha" style={{ width: '200px' }} />
          <FontAwesomeIcon icon={faRedo} style={{ cursor: 'pointer', fontSize:'1.4rem' }} onClick={this.generateNewCaptcha} />
        </div>
        <form onSubmit={this.handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input type="text" placeholder='Enter Captcha' value={inputValue} onChange={this.handleInputChange} style={{ padding: '8px', margin: '5px', borderRadius: '5px', border: '1px solid #ccc' }} />
          <button type="submit" className='tab-btn' >Continue</button>
        </form>
      </div>      
    );
  }
}

export default Captcha;
