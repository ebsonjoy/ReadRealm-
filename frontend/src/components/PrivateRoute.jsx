import { Navigate,Outlet } from "react-router-dom";
import { useSelector } from "react-redux";



const PrivateRoute = () => {
const  {userData} = useSelector((state)=>state.auth)
  return userData ? <Outlet/> : <Navigate to= '/user-login' replace />
}

export default PrivateRoute