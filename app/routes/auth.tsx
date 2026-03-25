import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router";

export const meta=()=>(
    [
        {title:"resumind || auth"},
        {name:"description",content:"log into your account"}

    ]
)
const Auth = () => {
    const{isLoading,auth}=usePuterStore()
    const location = useLocation()
    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "/";
    const navigate=useNavigate()

    useEffect(()=>{
     if(auth.isAuthenticated) navigate(next)
    },[auth.isAuthenticated,next])
  return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className="gradient-border shadow-lg ">
          <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
              <div className="flex flex-col items-center gap-2 text-center">
                  <h1>Welcome</h1>
                  <h2>Log in to continue your job journey</h2>
              </div>
              <div>
                  {isLoading ?(
                      <button className="auth-button animate-pulse">
                          <p>Signing  you in </p>
                      </button>
                  ): (
                      <>
                          {auth.isAuthenticated ? (
                              <button className="auth-button" onClick={auth.signOut}>
                                  <p>log out</p>
                              </button>
                          ): (
                              <button className="auth-button" onClick={auth.signIn}>
                                  <p>login</p>
                              </button>
                          )}
                      </>
                  )}
              </div>

          </section>
      </div>
      </main>
  );
};

export default Auth;