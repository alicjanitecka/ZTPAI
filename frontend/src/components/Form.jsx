// import { useState } from "react";
// import api from "../api";
// import { useNavigate } from "react-router-dom";
// import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
// import "../styles/Form.css"
// import LoadingIndicator from "./LoadingIndicator";

// function Form({ route, method }) {
//     const [username, setUsername] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const name = method === "login" ? "Login" : "Register";

//     const handleSubmit = async (e) => {
//         setLoading(true);
//         e.preventDefault();

//         try {
//             const data = method === "login" 
//                 ? { username, password } 
//                 : { username, email, password };
//                 const res = await api.post(route, data)
//             if (method === "login") {
//                 localStorage.setItem(ACCESS_TOKEN, res.data.access);
//                 localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
//                 navigate("/")
//             } else {
//                 navigate("/login")
//             }
//         } catch (error) {
//             alert(error)
//         } finally {
//             setLoading(false)
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="form-container">
//             <h1>{name}</h1>
//             {method === "register" && ( 
//                 <input
//                     className="form-input"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Email"
//                     required
//                 />
//             )}
//             <input
//                 className="form-input"
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 placeholder="Username"
//             />
//             <input
//                 className="form-input"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Password"
//             />
//             {loading && <LoadingIndicator />}
//             <button className="form-button" type="submit">
//                 {name}
//             </button>
//         </form>
//     );
// }

// export default Form