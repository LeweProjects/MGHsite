import React, { useEffect, useState } from "react";
import doc from "../../images/doc.jpg";
import Aos from "aos";
import "aos/dist/aos.css";
import SomeoneF2f from "./SomeoneOnline";
import supabase from "../../config/Supabase";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PiEye, PiEyeClosed } from "react-icons/pi";
import { v4 as uuidv4 } from "uuid";
import { ThreeDots } from "react-loader-spinner";

const OnlineConsult = ({ openTerms, token }) => {
  //*make pass visible or not
  const [visible, setVisible] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const isOpen = visible ? "text" : "password";
  const isConfirmOpen = visible1 ? "text" : "password";

  //*If booking for someone
  const [isSomeone, setSomeone] = useState(null);
  const [checkedSomeone, setChecked] = useState("No");
  const isChecked = (value) => value === checkedSomeone;

  const onSelect = ({ target: { value } }) => {
    setChecked(value);
  };
  useEffect(() => {
    if (checkedSomeone === "Yes") {
      setSomeone(true);
    }
    if (checkedSomeone === "No") {
      setSomeone(false);
    }
  }, [isSomeone, checkedSomeone]);
  //*For reading patient's form data
  const [formData, setFormData] = useState({
    Gmail: "",
    Fname: "",
    Lname: "",
    Mname: "",
    Address: "",
    Date: "",
    Time: "",
    Reason: "",
    Number: "",
    Relation: "",
    PatientBday: "",
    PatientAge: "",
    Pass: "",
    Confirm_pass: "",
  });
  //*Getting user's data
  const [Representative, setRepresentative] = useState();
  useEffect(() => {
    if (token) {
      setRepresentative(
        token.user.user_metadata.first_name +
          " " +
          token.user.user_metadata.middle_name +
          " " +
          token.user.user_metadata.last_name
      );
      setFormData((prevFormData) => ({
        ...prevFormData,
        Address: token.user.user_metadata.address,
      }));
      if (isSomeone === false) {
        setID(token.user.id);
        //to wait loading of token and avoid error
        setFormData((prevFormData) => ({
          //*automatically set the input values with user data
          ...prevFormData,
          Gmail: token.user.email,
          Fname: token.user.user_metadata.first_name,
          Lname: token.user.user_metadata.last_name,
          Mname: token.user.user_metadata.middle_name,
          Number: token.user.user_metadata.phone,
          PatientBday: token.user.user_metadata.birth_date,
        }));
      }
    }
  }, [token, isSomeone]);
  const [userID, setID] = useState("");

  //*function to read user inputs
  function handleChange(event) {
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [event.target.name]: event.target.value,
      };
    });
  }
  const [File, setFile] = useState([]);
  const [isSelected, setSelected] = useState(false);
  const [image, setImage] = useState(null);
  //*Drag and Drop function
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setSelected(true);
    //preview image
    setImage(URL.createObjectURL(e.dataTransfer.files[0]));
    setFile(e.dataTransfer.files);
  };
  //*Handle File Input
  const handleFile = (e) => {
    e.preventDefault();
    setSelected(true);
    //preview image
    setImage(URL.createObjectURL(e.target.files[0]));
    setFile(e.target.files);
  };
  //*Handle choosing of another file
  const handleCancel = (e) => {
    e.preventDefault();
    setSelected(false);
    //preview image
    setImage(null);
    setFile(null);
  };
  //*Image uploading
  async function uploadImage() {
    const { data, error } = await supabase.storage
      .from("images")
      .upload(formData.Gmail + "/payment/" + uuidv4(), File[0]);
    if (error) {
      console.log(error);
    }
    if (data) {
      setSelected(false);
      setImage(null);
      setFile(null);
    }
  }

  //*After Submitting form data will be stored in supabase/database
  const navigate = useNavigate();
  const [SubmitLoad, setSubLoad] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    //*If there is no screenshot uploaded
    if (!isSelected) {
      toast.error("Please finish the payment first", {
        toastId: "imageErr",
      });
      return;
    }
    setSubLoad(true);
    uploadImage();
    //* if user is logged in
    if (token) {
      const { error } = await supabase.from("Patient_Appointments").insert([
        {
          user_id: userID,
          appointee: isSomeone ? Representative : "",
          docname: Name,
          fname: formData.Fname,
          lname: formData.Lname,
          mname: formData.Mname,
          email: formData.Gmail,
          number: formData.Number,
          date: formData.Date,
          time: formData.Time,
          address: formData.Address,
          reason: formData.Reason,
          relation: formData.Relation,
          age: formData.PatientAge,
          bday: formData.PatientBday,
          someone: checkedSomeone,
          honorific: Honor,
          type: "ol",
          status: "pending",
        },
      ]);
      if (error) {
        console.log(error);
        toast.error(error, {
          toastId: "dataError",
        });
        setSubLoad(true);
      } else {
        navigate("/Appointment/Success");
      }
    }

    //*if user is not logged in
    else if (!token) {
      setSubLoad(true);
      //*Compare pass and confirm pass if similar
      if (formData.Pass !== formData.Confirm_pass) {
        toast.error("Your password doesn't match", {
          toastId: "dataError",
        });
        setSubLoad(false);
        return;
      }
      const { error: errSignUp } = await supabase.auth.signUp({
        email: formData.Gmail,
        password: formData.Pass,
        sendOtp: true,
        options: {
          emailRedirectTo:
            "https://leweprojects.github.io/MGHsite/?#/Appointment/Success",
          data: {
            username: formData.Mname + formData.Lname,
            first_name: formData.Fname,
            last_name: formData.Lname,
            middle_name: formData.Mname,
            phone: formData.Number,
            birth_date: formData.PatientBday,
            role: "patient",
            address: formData.Address,
          },
        },
      });
      if (errSignUp) {
        toast.error(errSignUp);
        console.log(errSignUp);
        setSubLoad(false);
      } else {
        navigate("/Appointment/Verifying");
        const { error: ErrApp } = await supabase
          .from("Patient_Appointments")
          .insert([
            {
              appointee: isSomeone ? Representative : "",
              docname: Name,
              fname: formData.Fname,
              lname: formData.Lname,
              mname: formData.Mname,
              email: formData.Gmail,
              number: formData.Number,
              date: formData.Date,
              time: formData.Time,
              reason: formData.Reason,
              relation: formData.Relation,
              age: formData.PatientAge,
              bday: formData.PatientBday,
              someone: checkedSomeone,
              honorific: Honor,
              type: "ol",
              status: "pending",
            },
          ]);
        if (ErrApp) {
          console.log(ErrApp);
          toast.error(ErrApp, {
            toastId: "dataError",
          });
          setSubLoad(false);
        } else {
          toast.success("Succesfully appointed", {
            toastId: "success",
          });
          toast.info("Please wait for booking and scheduling confirmation.");
        }
      }
    }
  };
  //*Doctor's Data
  const [Honor, setHonor] = useState("");
  const [Name, setName] = useState("");
  const [Special, setSpecial] = useState("");
  const [Sub, setSub] = useState("");
  const { id } = useParams();

  //*function for Doctor's Data to get from supabase
  const fetchDoctor = async () => {
    const { data, error } = await supabase
      .from("Dr_information")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
    }
    if (data) {
      setHonor(data.Honorific);
      setName(data.Name);
      setSpecial(data.specialization);
      setSub(data.SubSpecial);
    }
  };
  //*REAL TIME DOCTOR DATA
  useEffect(() => {
    fetchDoctor();
    supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Dr_information" },
        () => {
          fetchDoctor();
        }
      )
      .subscribe();
  }, []);

  //*To prevent user inputting past dates

  const disablePastDate = () => {
    const today = new Date();
    const dd = String(today.getDate() + 1).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = today.getFullYear();
    return yyyy + "-" + mm + "-" + dd;
  };

  //*Aos animation
  useEffect(() => {
    Aos.init({ duration: 500 });
  }, []);
  return (
    <div className="back p-8 flex justify-between">
      <>
        <div
          data-aos="fade-up"
          className="text-center justify-center w-[16%] ml-52"
        >
          <img data-aos="fade-up" src={doc} className="px-5 py-3" alt="" />
          <p data-aos="fade-up" className="font-semibold">
            {Honor} {Name}
          </p>
          <p data-aos="fade-up">{Special}</p>
          <p data-aos="fade-up">{Sub} </p>
        </div>
      </>
      <div
        data-aos="fade-up"
        className="text-center mt-3 w-[58%] mr-52 text-[#315E30]"
      >
        <h1 className="text-5xl font-semibold">
          Fill up the form to proceed reservation{" "}
        </h1>

        <span className="text-4xl">(Online Consultation)</span>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-3 rounded-lg shadow-2xl mt-9"
        >
          {SubmitLoad ? (
            <div className="flex text-3xl h-[50rem] items-center justify-center">
              <p className="mr-3">submitting please wait </p>
              <ThreeDots
                height="90"
                width="50"
                radius="5"
                color="#315E30"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClassName=""
                visible={true}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-start ml-9 mt-3">
                <p className="mb-2 font-semibold">
                  Are you booking an appointment for someone?
                </p>
                <div className="flex space-x-5">
                  <div className="font-thin mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
                    <input
                      className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid
                     border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full 
                     before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1]
                      after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] 
                      checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] 
                      checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] 
                      checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] 
                      focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)]
                      focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 
                      checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s]
                   "
                      type="radio"
                      name="Someone"
                      autoComplete="off"
                      onChange={onSelect}
                      value="Yes"
                      required
                      checked={isChecked("Yes")}
                    />
                    <label className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer">
                      Yes
                    </label>
                  </div>
                  <div className="font-thin mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
                    <input
                      className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none
                    rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none
                    before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent
                     before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] 
                     after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary
                     checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 
                     checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary
                     checked:after:bg-primary  checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] 
                     hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] 
                     focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] 
                     focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s]
                     checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]
                     checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s]"
                      type="radio"
                      name="Someone"
                      autoComplete="off"
                      onChange={onSelect}
                      value="No"
                      required
                      checked={isChecked("No")}
                    />
                    <label className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer">
                      No
                    </label>
                  </div>
                </div>
              </div>
              <div>
                {isSomeone ? (
                  <SomeoneF2f
                    isSelected={isSelected}
                    image={image}
                    handleCancel={handleCancel}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    handleFile={handleFile}
                    openTerms={openTerms}
                    setFormData={setFormData}
                    visible={visible}
                    visible1={visible1}
                    setVisible1={setVisible1}
                    setVisible={setVisible}
                    isOpen={isOpen}
                    isConfirmOpen={isConfirmOpen}
                    formData={formData}
                    handleChange={handleChange}
                    disablePastDate={disablePastDate}
                    token={token}
                    File={File}
                  />
                ) : (
                  <div
                    data-aos="zoom-in-right"
                    className="grid font-semibold text-left grid-cols-3 gap-5 px-8 mt-5"
                  >
                    <p>
                      First Name: <br />
                      <input
                        type="text"
                        name="Fname"
                        value={formData.Fname}
                        onChange={handleChange}
                        autoComplete="on"
                        required
                        disabled={token}
                        className="outline-none rounded-md font-thin border-2 px-2 border-slate-300 focus:border-[#71b967d3] w-full"
                      />
                    </p>
                    <p>
                      Last Name: <br />
                      <input
                        name="Lname"
                        value={formData.Lname}
                        onChange={handleChange}
                        autoComplete="on"
                        required
                        disabled={token}
                        className="outline-none rounded-md font-thin border-2 px-2 border-slate-300 focus:border-[#71b967d3] w-full"
                      />
                    </p>
                    <p>
                      Middle Name: <br />
                      <input
                        name="Mname"
                        value={formData.Mname}
                        onChange={handleChange}
                        autoComplete="on"
                        disabled={token}
                        className="outline-none rounded-md font-thin border-2 px-2 border-slate-300 focus:border-[#71b967d3] w-full"
                      />
                    </p>
                    <p>
                      Mobile Number:{" "}
                      <span className="lowercase font-thin text-sm text-green-800">
                        (Input a number only)
                      </span>
                      <br />
                      <input
                        name="Number"
                        autoComplete="on"
                        type="number"
                        value={formData.Number}
                        onChange={handleChange}
                        required
                        disabled={token}
                        className="outline-none rounded-md font-thin border-2 px-2 grid- border-slate-300 focus:border-[#71b967d3] w-full"
                      />
                    </p>
                    <p className=" col-span-2 w-1/2">
                      Gmail: <br />
                      <input
                        name="Gmail"
                        autoComplete="on"
                        onChange={handleChange}
                        value={formData.Gmail}
                        disabled={token}
                        required
                        className="outline-none rounded-md font-thin border-2 px-2 border-slate-300 focus:border-[#71b967d3] w-full"
                      />
                    </p>
                    {!token && (
                      <>
                        <div className="col-span-3 flex -mb-7">
                          <p className="font-thin text-base text-green-600 mb-3">
                            We require you to register in our website in order
                            for you to monitor your appointment status
                          </p>
                        </div>

                        <div className="select-none">
                          <label className="text-lg">Password</label>
                          <div className="flex items-center">
                            <input
                              name="Pass"
                              type={isOpen}
                              autoComplete="on"
                              onChange={handleChange}
                              required
                              className="outline-none rounded-md font-thin border-2 px-2 border-slate-300 focus:border-[#71b967d3] w-full"
                            />
                            <div
                              onClick={() => setVisible(!visible)}
                              className="cursor-pointer -ml-7 text-[20px] "
                            >
                              {visible ? <PiEye /> : <PiEyeClosed />}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 w-1/2">
                          Confrim Password: <br />
                          <div className="flex items-center select-none">
                            <input
                              name="Confirm_pass"
                              type={isConfirmOpen}
                              autoComplete="on"
                              onChange={handleChange}
                              required
                              className="outline-none mt-1 rounded-md font-thin border-2 px-2 border-slate-300 focus:border-[#71b967d3] w-full"
                            />
                            <div
                              onClick={() => setVisible1(!visible1)}
                              className="cursor-pointer -ml-7 text-[20px] "
                            >
                              {visible1 ? <PiEye /> : <PiEyeClosed />}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {!token && (
                      <div className="flex">
                        <p>
                          Your Date of Birth: <br />
                          <input
                            name="PatientBday"
                            autoComplete="on"
                            onChange={handleChange}
                            className="outline-none border-2 font-thin px-2 h-9 rounded-lg border-slate-300 focus:border-[#71b967d3]"
                            type="date"
                            required
                          />
                        </p>
                        <div className="ml-3">
                          <p className="-ml-1">
                            Your Age:
                            <br />
                          </p>
                          <input
                            name="PatientAge"
                            type="number"
                            autoComplete="on"
                            required
                            className="outline-none rounded-md font-thin w-20 border-2 px-2 border-slate-300 focus:border-[#71b967d3]"
                          />
                        </div>
                      </div>
                    )}

                    <div className="col-span-2">
                      <p className="whitespace-normal ">
                        Select Date of the appointment:
                      </p>
                      <input
                        name="Date"
                        autoComplete="on"
                        onChange={handleChange}
                        className="outline-none border-2 w-44 font-thin px-2 h-9 rounded-lg border-slate-300 focus:border-[#71b967d3]"
                        type="date"
                        required
                        min={disablePastDate()}
                      />
                    </div>
                    <p className="col-span-2 row-span-2">
                      Your Brgy. or Municipality: <br />
                      <textarea
                        name="Address"
                        autoComplete="on"
                        value={formData.Address}
                        onChange={handleChange}
                        required
                        className="outline-none border-2 font-thin px-2 h-28 rounded-md border-slate-300 focus:border-[#71b967d3] w-full"
                      />
                    </p>
                    <p className="col-span-3">
                      Reason/s for booking an appointment: <br />
                      <textarea
                        name="Reason"
                        autoComplete="off"
                        onChange={handleChange}
                        placeholder="Your message here"
                        required
                        className="outline-none border-2 font-thin px-3 py-2 h-56 rounded-md border-slate-300 focus:border-[#71b967d3] w-full"
                      />
                    </p>
                    <p className="col-span-3 text-xl text-center">PAYMENT </p>
                    <div className="col-span-3 items-center grid grid-cols-2 font-thin">
                      <div className="flex flex-col items-center">
                        <div className="flex">
                          <span className="font-semibold">Step 1:</span> Scan
                          the QR code to pay using Gcash
                        </div>

                        <div className="p-40 bg-slate-400 flex whitespace-nowrap text-white font-bold">
                          QR code here
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="flex">
                          <span className="font-semibold">Step 2:</span>{" "}
                          Screenshot your payment receipt and upload here
                        </div>
                        {isSelected ? (
                          <div className="flex flex-col items-center -mb-16">
                            <img
                              className="object-contain mb-4 rounded-md items-center justify-center w-full h-[20rem]"
                              src={image}
                              alt="/"
                            />

                            <ul className="flex">
                              <p className="font-semibold whitespace-nowrap mr-2">
                                File Name:{" "}
                              </p>
                              {Array.from(File).map((file, idx) => (
                                <li className="truncate" key={idx}>
                                  {file.name}
                                </li>
                              ))}
                            </ul>

                            <div className="flex space-x-4 mb-4">
                              <button
                                className="text-gray-900 bg-white border border-gray-300 focus:outline-none
               transition duration-75 ease-in hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 
               font-medium rounded-lg px-5 dark:bg-gray-800 dark:text-white dark:border-gray-600
                dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                onClick={handleCancel}
                              >
                                Choose another file
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full">
                            {/* Drop-Zone */}
                            <label
                              onDragOver={handleDragOver}
                              onDrop={handleDrop}
                              accept="image/png, image/jpeg"
                              className="flex flex-col mb-5 rounded-md items-center justify-center w-[80%] h-[21rem] border-2
                     border-gray-300 border-dashed cursor-pointer bg-gray-50 transition duration-100 ease-in dark:hover:bg-bray-800
                    dark:bg-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:hover:border-gray-500
                    dark:hover:bg-gray-600"
                            >
                              <div className="flex flex-col items-center pt-5 pb-6">
                                <svg
                                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 20 16"
                                >
                                  <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                  />
                                </svg>

                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  PNG or JPG
                                </p>
                              </div>

                              {/* Image input */}
                              <input
                                id="dropzone-file"
                                onChange={handleFile}
                                accept="image/png, image/jpeg"
                                type="file"
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center mb-6 whitespace-nowrap">
                      <input
                        id="default-checkbox"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        required
                      />

                      <label className="ml-2 text-sm font-thin">
                        Terms and Condition
                        <button onClick={openTerms} className="text-primary">
                          Read More
                        </button>
                      </label>
                    </div>
                  </div>
                )}

                <div className="col-span-3 mb-6">
                  <button
                    type="submit"
                    className="bg-[#418D3F] w-full py-1  font-semibold text-xl text-white rounded-md transition duration-10 ease-in-out hover:bg-[#A5DD9D] hover:text-[#267124] hover:ring-[#418D3F] hover:ring-[3px]"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default OnlineConsult;