import React, { useState } from 'react';
import '../css/style.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import Navbar from './Navbar'
function StaffLogin() {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        email: '',
        password: '',
    })

    function login(event) {
        event.preventDefault();
        console.log(values);

        axios.post("http://localhost:5000/stafflogin", values)
            .then(res => {
                if (res.status === 200 && res.data.message === "Login successful") {
                    // Optionally store user info or token in localStorage/sessionStorage here
                    localStorage.setItem("staff", JSON.stringify(res.data.staff));
                    navigate("/dashboard");
                } else {
                    alert(res.data.message || "Login failed");
                }
            })
            .catch(err => {
                console.error(err);
                alert("Something went wrong during login");
            });
    }


    return <>
        {/* <Navbar /> */}
        <div className={`content justify-content-center align-items-center d-flex shadow-lg `} id="content">
            {/* Registration Form */}
            <div className='col-md-6 d-flex justify-content-center'>
                <form>
                    <div className='header-text mb-4'>
                        <h1>Create Account</h1>
                    </div>
                    <div className='input-group mb-3'>
                        <input type='text' placeholder='Name' className='form-control form-control-lg bg-light fs-6' onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className='input-group mb-3'>
                        <input type='email' placeholder='Email' className='form-control form-control-lg bg-light fs-6' onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className='input-group mb-3'>
                        <input type='password' placeholder='Password' className='form-control form-control-lg bg-light fs-6' onChange={e => setPassword(e.target.value)} required />
                    </div>
                </form>
            </div>

            {/* Login Form */}
            <div className='col-md-6 right-box'>
                <form onSubmit={login}>
                    <div className='header-text mb-4'>
                        <h1>Staff Login</h1>
                    </div>
                    <div className='input-group mb-3'>
                        <input type='email' placeholder='Email' className='form-control form-control-lg bg-light fs-6' onChange={e => setValues({ ...values, email: e.target.value })} required />
                    </div>
                    <div className='input-group mb-3'>
                        <input type='password' placeholder='Password' className='form-control form-control-lg bg-light fs-6' onChange={e => setValues({ ...values, password: e.target.value })} required />
                    </div>
                    {/* <div className='input-group mb-5 d-flex justify-content-between'>
                        <div className='form-check'>
                            <input type='checkbox' className='form-check-input' />
                            <label htmlFor='formcheck' className='form-check-label text-secondary'><small>Remember me</small></label>
                        </div>
                        <div className='forgot'>
                            <small><a href='#'>Forgot password?</a></small>
                        </div>
                    </div> */}
                    <div className='input-group mb-3 justify-content-center'>
                        <button className='btn  w-50'>Login</button>
                    </div>
                </form>
            </div>

            {/* Switch Panel */}
            <div className='switch-content'>
                <div className='switch'>
                    <div className='switch-panel switch-right'>
                        <h1>Hello, Again</h1>
                        <p>We are happy to see you back</p>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default StaffLogin;
