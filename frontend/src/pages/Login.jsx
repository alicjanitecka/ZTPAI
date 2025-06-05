import Form from "../components/Login"

function Login() {
    return <Form route="/api/v1/token/" method="login" />
}

export default Login