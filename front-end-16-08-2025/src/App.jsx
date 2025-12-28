import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import TrasnsactionTable from './transactiontable'
import BudgetComponent from './budgetcomponent';
import { SnackbarProvider } from "./snackbarcontext";
import Navbar from './navbar'
import SignInSignUp from './signinsignup';
import ProtectedRoute from './protectedroutes';


function App() {

  return (
    <>
      <Router>

        <SnackbarProvider>
          <Routes>
            {/* Public routes (no navbar) */}
            <Route path="/" element={

                <SignInSignUp />

            } />

            <Route path="/managetransactions" element={
              <ProtectedRoute>

                <Navbar />
              </ProtectedRoute>

            }
            />
            {/* <Route path="/login" element={<SignInSignUp />} /> */}

          </Routes>

        </SnackbarProvider>
      </Router>
    </>

    //  <>
    //   <Router>

    //     <SnackbarProvider>
    //       <Routes>
    //         {/* Public routes (no navbar) */}
    //         <Route path="/" element={
             

    //             <SignInSignUp />
            

    //         } />

    //         <Route path="/managetransactions" element={
              
    //             <Navbar />
              

    //         }
    //         />
    //         {/* <Route path="/login" element={<SignInSignUp />} /> */}

    //       </Routes>

    //     </SnackbarProvider>
    //   </Router>
    // </>
  )
}

export default App
