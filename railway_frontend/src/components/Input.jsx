import React, { Component } from 'react';

class Input extends Component {
    render() {
        const {id, type, name, onChange, value, error,  classy,...otherProps} = this.props
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection:"column"
            }}>
                <input
                    className={classy}
                    type={type}
                    id={id}
                    name={name}
                    onChange={onChange}
                    value={value}
                    {...otherProps}
                />
                {error && <div className='error-div'>{error}</div>}
            </div>
        );
    }
}

export default Input;