import Form from "../components/Login"

function Login() {
    return <Form route="/api/token/" method="login" />
}

export default Login