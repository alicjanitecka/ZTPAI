import Form from "../components/Signup"

function Register() {
    return <Form route="/api/v1/user/register/" method="register" />
}

export default Register