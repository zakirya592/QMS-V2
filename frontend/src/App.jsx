import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DataTableProvider from "./Contexts/DataTableContext";
import { QueryClient, QueryClientProvider } from "react-query";
import RolesProvider from "./Contexts/FetchRolesContext.jsx";
import PatientInformation from "./Pages/patientInformation/patientInformation.jsx";
import Login from "./Pages/adminLogin/login.jsx";
import WaitingArea from "./Pages/waintingArea/waitingArea.jsx";
import Dashboard from "./Pages/dashboard/dashoboard.jsx";
import LocationAssignment from "./Pages/locationAssignment/locationAssignment.jsx";
const queryClient = new QueryClient();

const App = () => {
  return (
    <>
      <DataTableProvider>
        <RolesProvider>
          <div>
            <BrowserRouter>
              <QueryClientProvider client={queryClient}>
                <Routes>
                  <Route path="/patient-information" element={<PatientInformation />} />
                  <Route path="/" element={<Login />} />
                  <Route path="/waiting-area" element={<WaitingArea />} />  
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/location-assignment" element={<LocationAssignment />} />
                </Routes>
              </QueryClientProvider>
            </BrowserRouter>
          </div>
        </RolesProvider>
      </DataTableProvider>
    </>
  );
};

export default App;
