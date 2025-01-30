import React, { useState, useEffect } from "react";
import SideNav from "../../components/Sidebar/SideNav";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useParams } from "react-router-dom";
import { baseUrl } from "../../utils/config";
import AssignPopup from "./assignPopup";
import toast from "react-hot-toast";
import Spinner from "../../components/spinner/spinner";
import newRequest from "../../utils/newRequest";
import { useQuery } from "react-query";
import Barcode from "react-barcode";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
const WaitingArea = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showBandPopup, setShowBandPopup] = useState(false);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const { t } = useTranslation();
  const { id } = useParams();
  const [PatientName, setPatientName] = useState("");
  const [IDNumber, setIDNumber] = useState("");
  const [Age, setAge] = useState("");
  const [ChiefComplaint, setChiefComplaint] = useState("");
  const [Allergies, setAllergies] = useState("No");
  const [VitalSigns, setVitalSigns] = useState({
    BP: "",
    HR: "",
    TEMP: "",
    RR: "",
    SPO2: "",
    RBS: "",
    Height: "",
    Weight: "",
    TimeVS: "",
  });
  const [MobileNumber, setMobileNumber] = useState("");
  const [Sex, setSex] = useState("");
  const [Nationality, setNationality] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [callPatient, setCallPatient] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [mrnNumber, setMrnNumber] = useState("");

  const { isLoading, data, error, refetch } = useQuery("fetchAllMegaMenuss", async () => {
    try {
      const response = await newRequest.get(`/api/v1/patients/${id}`);
      return response?.data?.data || {};
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  useEffect(() => {
    if (data) {
      const patient = data;
      setPdfUrl(patient?.ticket);
      setPatientData(patient);
      setPatientName(patient.name);
      setIDNumber(patient.idNumber);
      setAge(patient.age);
      setChiefComplaint(patient.cheifComplaint);
      setMobileNumber(patient.mobileNumber);
      setSex(patient.sex);
      setNationality(patient.nationality);
      setCallPatient(patient.callPatient);
      setBloodGroup(patient.bloodGroup);
      // format date
      // setBirthDate(patient.birthDate.split('T')[0]);
      setBirthDate(patient.birthDate ? patient.birthDate.split('T')[0] : "");
      setMrnNumber(patient.mrnNumber);
      if (patient.vitalSigns?.length > 0) {
        const latestVitalSign = patient.vitalSigns[0];
        setVitalSigns({
          BP: latestVitalSign.bp,
          HR: latestVitalSign.hr,
          TEMP: latestVitalSign.temp,
          RR: latestVitalSign.rr,
          SPO2: latestVitalSign.spo2,
          RBS: latestVitalSign.rbs,
          Height: latestVitalSign.height,
          Weight: latestVitalSign.weight,
          TimeVS: latestVitalSign.timeVs,
        });
      }
    }
  }, [data]);

  const handleVitalChange = (e) => {
    setVitalSigns({ ...VitalSigns, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    const patientId = id;
    const body = {
      bp: VitalSigns.BP,
      height: VitalSigns.Height,
      temp: VitalSigns.TEMP,
      spo2: VitalSigns.SPO2,
      weight: VitalSigns.Weight,
      hr: VitalSigns.HR,
      rbs: VitalSigns.RBS,
      rr: VitalSigns.RR,
      timeVs: new Date().toISOString(),
      allergies: Allergies === "Yes",
    };

    try {
      const response = await newRequest.post(
        `/api/v1/patients/${patientId}/vital-sign`,
        body,
      );
      if (response.status >= 200) {
        toast.success(response?.data?.message || "Vital sign created successfully");
        refetch()
      } else {
        throw new Error(response?.data?.message || "Unexpected error");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to save vital sign";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCallPatientToggle = async () => {
    const newCallPatientStatus = !callPatient;
    setCallPatient(newCallPatientStatus);

    try {
      const response = await fetch(`${baseUrl}/api/v1/patients/${id}/toggle-call`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ callPatient: newCallPatientStatus }),
      });

      const data = await response.json();
      toast.success(data?.message || "Patient call status toggled successfully");
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
    }
  };
  const openPopup = async () => {
    setShowPopup(true);
    refetch()
  };
  const closePopup = () => {
    setShowPopup(false);
  };

  const openBandPopup = () => {
    setShowBandPopup(true);
  };

  const closeBandPopup = () => {
    setShowBandPopup(false);
  };

  return (
    <div className="bg-gray-100">
      <SideNav>
        <div className="min-h-screen flex flex-col antialiased bg-white text-black">
          {/* {loading ? (
            <Spinner />
          ) : ( */}
          <div className="container mx-auto p-6">
            <div className="bg-green-50 shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-green-700 font-bold text-xl">
                  {patientData?.name}
                </h5>
                <p className="text-gray-600 text-sm">
                  {new Date(patientData?.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("Patient Name")}
                  </label>
                  <input
                    type="text"
                    value={PatientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={t("Enter patient name")}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("Mobile Number")}
                  </label>
                  <input
                    type="text"
                    value={MobileNumber}
                    readOnly
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("ID Number")}
                  </label>
                  <input
                    type="text"
                    value={IDNumber}
                    onChange={(e) => setIDNumber(e.target.value)}
                    placeholder={t("Enter ID number")}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("Nationality")}
                  </label>
                  <input
                    type="text"
                    value={Nationality}
                    readOnly
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("Age")}
                  </label>
                  <input
                    type="text"
                    value={Age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={t("Enter age")}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("Gender")}
                  </label>
                  <input
                    type="text"
                    value={Sex}
                    readOnly
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("Blood Group")}
                  </label>
                  <input
                    type="text"
                    value={bloodGroup}
                    readOnly
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("Birth Date")}
                  </label>
                  <input
                    type="text"
                    value={birthDate}
                    readOnly
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("MRN Number")}
                  </label>
                  <input
                    type="text"
                    value={mrnNumber}
                    readOnly
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("Chief Complaint")}
                  </label>
                  <input
                    type="text"
                    value={ChiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder={t("Describe the complaint")}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="bg-green-50 shadow-md rounded-lg p-6 mt-6">
              <h5 className="text-green-700 font-bold text-xl mb-4">
                Vital Sign
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  "BP",
                  "HR",
                  "TEMP",
                  "RR",
                  "SPO2",
                  "RBS",
                  "Height",
                  "Weight",
                ].map((field) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-gray-700">
                      {t(field)}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={VitalSigns[field]}
                      onChange={handleVitalChange}
                      placeholder={t(`Enter ${field}`)}
                      className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center space-x-4">
                <span className="text-sm font-medium text-red-700">
                  {t("Allergies")}
                </span>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="Allergies"
                      value="Yes"
                      checked={Allergies === "Yes"}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="form-radio text-green-600"
                    />
                    <span className="ml-2 text-sm">{t("Yes")}</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="Allergies"
                      value="No"
                      checked={Allergies === "No"}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="form-radio text-green-600"
                    />
                    <span className="ml-2 text-sm">{t("No")}</span>
                  </label>
                  {Allergies === "Yes" && (
                    <input
                      type="text"
                      placeholder={t("Specify")}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                  )}
                </div>
              </div>
              <div className="mt-6 flex items-center space-x-4">
                {patientData?.department &&
                  patientData?.department?.deptname !== "TR" && (
                    <span className="text-sm font-medium text-green-700">
                      {t("Assigned To  ")}
                      <strong className="text-blue-700">
                        {patientData?.department?.deptname}
                      </strong>
                    </span>
                  )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                className={`text-white px-6 py-2 rounded-lg hover:bg-yellow-500  ${
                  callPatient
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-yellow-400 hover:bg-yellow-500"
                }`}
                onClick={handleCallPatientToggle}
              >
                {callPatient ? t("Cancel Call Patient") : t("Call Patient")}
              </button>
              <div className="flex space-x-4">
                <button
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                  onClick={openBandPopup}
                >
                  {t("Print Band")}
                </button>
                <button
                  className={`text-white px-6 py-2 rounded-lg hover:bg-blue-600 ${
                    VitalSigns.BP ? "" : "opacity-50 cursor-not-allowed"
                  } ${
                    callPatient
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-yellow-400 hover:bg-yellow-500"
                  }`}
                  onClick={handleOpen}
                >
                  {loading ? <Spinner /> : `${t("Assign")}`}
                </button>
                <button
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                  onClick={handleSave}
                >
                  {loading ? <Spinner /> : `${t("Save")}`}
                </button>
                <button
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                  onClick={openPopup}
                >
                  {t("Re-Print")}
                </button>

                <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">
                  {t("Void")}
                </button>
                <button className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                onClick={() => {
                  navigate(`/patient-table`);
                }}>
                  {t("Close")}
                </button>
              </div>
            </div>
          </div>
          {/* // )} */}
        </div>
      </SideNav>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold">Ticket Information</h2>
            {pdfUrl ? (
              <iframe
                src={`${baseUrl}/${pdfUrl}`}
                width="100%"
                height="600px"
                title="PDF Document"
              />
            ) : (
              <p>No PDF available</p>
            )}
            <button
              onClick={closePopup}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {isOpen && (
        <AssignPopup
          onClose={handleClose}
          patientId={id}
          onAssignSuccess={refetch}
        />
      )}
      {showBandPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div
              id="printableArea"
              className="flex justify-center items-center m-auto"
              style={{
                height: "7in",
                width: "0.75in", // Added width for consistency
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div id="inside-BRCode" style={{ marginBottom: "40px" }}>
                <QRCodeSVG value={IDNumber} width="170" height="70" />
              </div>

              <div
                style={{
                  margin: "0 auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                {/* <div
                  className="text-xs p-1"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                > */}
                <div
                  style={{
                    writingMode: "vertical-lr",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    // alignItems: "center",
                    justifyContent: "center",
                    margin: "auto",
                    textAlign: "left",
                    lineHeight: "1.5",
                  }}
                >
                  <p style={{ fontSize: "14px" }} className="DOG">
                    MRN Number: {IDNumber}
                  </p>
                  <p style={{ fontSize: "14px" }} className="text-start DOG">
                    Date of Birth: {Age}
                  </p>
                  <p style={{ fontSize: "14px" }} className="text-start DOG">
                    Blood Type: {bloodGroup}
                  </p>
                  <p style={{ fontWeight: "bold", fontSize: "16px" }}>
                    {PatientName?.toUpperCase()}
                  </p>
                </div>
                {/* </div> */}
              </div>

              <div id="inside-BRCode" style={{ marginTop: "40px" }}>
                <QRCodeSVG value={IDNumber} width="170" height="70" />
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const printContent = document.getElementById("printableArea");
                  const WinPrint = window.open("", "", "width=900,height=650");
                  WinPrint.document.write(`
    <html>
      <head>
        <style>
          @page {
            size: 0.75in 7in;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
          }
          #printableContent {
            width: 0.75in;
            height: 5in;
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          p {
            font-size: 12px;
            margin: 0;
          }
          p:first-of-type {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div id="printableContent">
          ${printContent.innerHTML}
        </div>
      </body>
    </html>
  `);
                  WinPrint.document.close();
                  WinPrint.focus();
                  setTimeout(() => {
                    WinPrint.print();
                    WinPrint.close();
                  }, 250);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Print
              </button>
              <button
                onClick={closeBandPopup}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitingArea;
