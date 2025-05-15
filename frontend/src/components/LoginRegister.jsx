import React, { useState } from 'react';
import '../css/style.css';
import {useNavigate} from 'react-router-dom';
import axios from 'axios'
import Navbar from './Navbar'
function LoginRegister() {
    
    const [isActive, setIsActive] = useState(false);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');  
    const [password, setPassword] = useState('');


    const navigate=useNavigate()

    function register(event) {
    event.preventDefault();
    
    // Log values to check if they are correctly set
    // console.log("Registering:", { username, email, password });

    axios.post("http://localhost:5000/register", { username, email, password })
        .then(res => {
            console.log("Registration Success:", res.data);
            setIsActive(false);
        })
        .catch(err => alert("User Already Exists"));
    }


    const [values,setValues]=useState({
        email:'',
        password:''
    })

    function login(event) {
        event.preventDefault();
        console.log(values); // Good for debugging

        axios.post("http://localhost:5000/login", values)
            .then(res => {
                if (res.status === 200) {
                    // Optionally store user or token in localStorage/sessionStorage
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    navigate("/");
                } else {
                    // Not likely to hit this because non-200s go to catch block
                    alert(res.data.message || "Something went wrong.");
                }
            })
            .catch(err => {
                console.error(err);
                if (err.response && err.response.data) {
                    alert(err.response.data.message); // From backend
                } else {
                    alert("Server not responding or network error.");
                }
            });
    }


    return <>
        {/* <Navbar/> */}
        <div className={`content justify-content-center align-items-center d-flex shadow-lg ${isActive ? 'active' : ''}`} id="content">
            {/* Registration Form */}
            <div className='col-md-6 d-flex justify-content-center'>
                <form onSubmit={register}>
                    <div className='header-text mb-4'>
                        <h1>Create Account</h1>
                    </div>
                    <div className='input-group mb-3'>
                        <input type='text' placeholder='Name' className='form-control form-control-lg bg-light fs-6' onChange={e=>setUsername(e.target.value)}/>
                    </div>
                    <div className='input-group mb-3'>
                        <input type='email' placeholder='Email' className='form-control form-control-lg bg-light fs-6' onChange={e=>setEmail(e.target.value)}required/>
                    </div>
                    <div className='input-group mb-3'>
                        <input type='password' placeholder='Password' className='form-control form-control-lg bg-light fs-6' onChange={e=>setPassword(e.target.value)}required/>
                    </div>
                    <div className='input-group mb-3 justify-content-center'>
                        <button className='btn  w-50'>Register</button>
                    </div>
                </form>
            </div>

            {/* Login Form */}
            <div className='col-md-6 right-box'>
                <form onSubmit={login}>
                    <div className='header-text mb-4'>
                        <h1>Sign In</h1>
                    </div>
                    <div className='input-group mb-3'>
                        <input type='email' placeholder='Email' className='form-control form-control-lg bg-light fs-6' onChange={e=>setValues({...values,email:e.target.value})}required/>
                    </div>
                    <div className='input-group mb-3'>
                        <input type='password' placeholder='Password' className='form-control form-control-lg bg-light fs-6' onChange={e => setValues({ ...values, password: e.target.value })}required />
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
                    <div className='switch-panel switch-left'>
                        <h1>Hello, Again</h1>
                        <p>We are happy to see you back</p>
                        <button className='hidden btn border-white w-50 fs-6' onClick={() => setIsActive(false)}>Login</button>
                    </div>
                    <div className='switch-panel switch-right'>
                        <h1>Welcome</h1>
                        <p>Join Our Unique Platform</p>
                        <button className='hidden btn border-white w-50 fs-6' onClick={() => setIsActive(true)}>Register</button>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default LoginRegister;
