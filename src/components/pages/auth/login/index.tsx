import { Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useThemeSettings } from "../../../../hooks/useThemeSettings";
import { PATH } from "../../../../routes/PATH";
import AuthHeader from "../../../molecules/AuthHeader";
import LoginForm from "../../../organism/LoginForm";

export default function Login() {
    const { brandName } = useThemeSettings();
    const { search } = useLocation();
    return (
        <>
            <AuthHeader
                title={brandName ? `Welcome to ${brandName} 👋🏻` : ""}
                description="You're one step closer to exponential growth"
            />
            <LoginForm />
            <div className="mt-14 text-center">
                <Typography variant="subtitle2" color="text.light">Dont Have an Account ? <Link to={{ pathname: PATH.AUTH.REGISTER.ROOT, search }} className="inline-block"><Typography color="primary" variant="subtitle2">Register</Typography></Link></Typography>
            </div>
        </>
    )
}
