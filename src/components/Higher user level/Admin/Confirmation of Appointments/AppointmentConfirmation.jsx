import React, { useState, useEffect } from "react";
import supabase from "../../../config/Supabase";
import { toast } from "react-toastify";
import Aos from "aos";
import "aos/dist/aos.css";
import { VscFilter, VscFilterFilled } from "react-icons/vsc";
import { BsSearch } from "react-icons/bs";
import { MagnifyingGlass } from "react-loader-spinner";
import AppconfirmPaginated from "./AppconfirmPaginated";
import CancelConfirm from "./CancelConfirm";

const AppointmentConfirmation = ({ CDNURL, user }) => {
  //TODO fix scroll animation
  //TODO: REDESIGN TABLE INTO BULK WITH PROFILE PIC
  //*prevent access from non-admin users
  // useEffect(() => {
  //   const fetchAdmin = async () => {
  //     const { data } = await supabase.from("profile").select("*").single();
  //     if (data.role !== "admin") {
  //       navigate("/Dashboard");
  //     }
  //   };
  //   fetchAdmin();
  // }, [navigate]);

  const [filt, setfilt] = useState([]);

  //*get filter inputs
  const [Search, setSearch] = useState("");
  const [Someone, setSomeone] = useState("");
  const [time, settime] = useState("");
  const [Type, setType] = useState("");
  const [Status, setStatus] = useState("");
  const [createdAt, setCreated] = useState("");
  const [isAsc, setisAsc] = useState(true);
  useEffect(() => {
    if (user) {
      //booked by someone
      if (Someone === "Show all") {
        setSomeone("");
      } //status
      if (Status === "Show all") {
        setStatus("");
      }
      //time
      if (time === "all") {
        settime("");
      }
      //created at
      if (createdAt === "descending") {
        setisAsc(true);
      } else if (createdAt === "ascending") {
        setisAsc(false);
      }
      //Type
      if (Type === "Show all") {
        setType("");
      } else if (Type === "Online Consult") {
        setType("ol");
      } else if (Type === "Face to face Consult") {
        setType("f2f");
      }
    }
  }, [
    user,
    createdAt,
    setisAsc,
    Status,
    time,
    Type,
    Someone,
    setSomeone,
    settime,
    setType,
  ]);
  const [Loaded, setLoaded] = useState(true);

  //*get patient appointments
  const [books, setBook] = useState([]);
  const fetchBooks = async () => {
    setLoaded(false);
    const { data, error } = await supabase
      .from("patient_Appointments")
      .select();
    if (error) {
      toast.error(error, {
        toastId: "dataError",
      });
      console.error("Failed to fetch", error.message);
    }

    if (data) {
      setLoaded(true);
      setfilt(data);
    }
  };

  //*search filter
  const [searchLoad, setsearchLoad] = useState(true);
  const handleSearch = () => {
    setsearchLoad(false);
    const search = filt.filter((items) => {
      const fname = items.fname?.toLowerCase().includes(Search.toLowerCase());
      const lname = items.lname?.toLowerCase().includes(Search.toLowerCase());
      const mname = items.mname?.toLowerCase().includes(Search.toLowerCase());
      const docname = items.docname
        ?.toLowerCase()
        .includes(Search.toLowerCase());
      const defStat2 = !items.status?.includes("Completed");
      const defStat3 = !items.status?.includes("rejected");
      return (fname || lname || mname || docname) && defStat2 && defStat3;
    });
    setBook(search);
    if (filt) {
      setTimeout(() => {
        setsearchLoad(true);
      }, 1000);
    }
  };

  //*Filter function
  useEffect(() => {
    if (filt) {
      const filterBook = filt
        .filter((item) => {
          //const defStat = !item.status.includes("Confirmed");
          const defStat2 = !item.status?.includes("Completed");
          const defStat3 = !item.status?.includes("rejected");
          const someone = item.someone?.includes(Someone);
          const Time = item.date?.toLowerCase().includes(time);
          const type = item.type?.toLowerCase().includes(Type);
          const status = item.status
            ?.toLowerCase()
            .includes(Status.toLowerCase());
          return defStat2 && defStat3 && someone && Time && type && status;
        })
        .sort((a, b) =>
          isAsc
            ? a.created_at > b.created_at
              ? -1
              : 1
            : a.created_at < b.created_at
            ? -1
            : 1
        );
      setBook(filterBook);
      if (books) {
        setTimeout(() => {
          setLoaded(true);
        }, 1000);
      }
    }
  }, [isAsc, Type, Status, time, Someone, setBook, filt]);

  //*Realtime data
  useEffect(() => {
    fetchBooks();
    supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patient_Appointments" },
        () => {
          fetchBooks();
        }
      )
      .subscribe();
  }, []);

  const [isFilterOpen, setisFilterOpen] = useState(false);

  //*Aos Function
  useEffect(() => {
    Aos.init({ duration: 500 });
  }, []);

  const [cancel, setCancel] = useState(false);
  const [bookID, setBookID] = useState();
  if (cancel) {
    document.documentElement.style.overflowY = "hidden";
  } else {
    document.documentElement.style.overflowY = "unset";
  }

  const bookSet = new Set();
  return (
    <>
      <div className="sticky top-1 z-50">
        {cancel && <CancelConfirm setReject={setCancel} id={bookID} />}
      </div>
      <div className="back h-full flex justify-center">
        <div className="w-[70%] ">
          <p className="text-4xl font-semibold text-[#315E30]"></p>

          {/*search and filter  */}
          <div className="w-full flex justify-between items-center mt-10 mb-3 ">
            <div
              onClick={() => setisFilterOpen(!isFilterOpen)}
              className="px-4 py-1 items-center select-none hover:cursor-pointer w-fit transition duration-75 
                       ease-in hover:bg-[#78b673f8] bg-[#98dd93c4] text-[#295f34] mx-4  rounded-full hover:text-white flex"
            >
              {isFilterOpen ? (
                <>
                  {" "}
                  <VscFilterFilled className="text-2xl mr-2" />
                  <p className="">Close Filter</p>
                </>
              ) : (
                <>
                  {" "}
                  <VscFilter className="text-2xl mr-2" />
                  <p className="">Filter</p>
                </>
              )}
            </div>
          </div>
          <div
            className={`${
              isFilterOpen
                ? "transition-all duration-300 ease-in overflow-y-visible max-h-[20rem]"
                : "transition-all duration-300 ease-out overflow-y-hidden max-h-0"
            }`}
          >
            <div className="bg-[#98dd93c4] px-5 pt-5 pb-8 mb-2 rounded-lg items-center gap-x-7 gap-y-4 grid grid-cols-3">
              <div className="flex flex-col">
                <label className="mb-1">Search by name</label>
                <div className="flex h-6 text-slate-500">
                  {!Search && (
                    <div
                      className={`${
                        isFilterOpen
                          ? "absolute flex space-x-1 items-center translate-x-4"
                          : "hidden"
                      }`}
                    >
                      <BsSearch className="w-4" />
                      <p>Type here</p>
                    </div>
                  )}
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-3 rounded-l-md h-8 w-full text-black border-slate-400 border-2"
                    />
                    <button
                      onClick={handleSearch}
                      className="bg-[#60af5ac4] h-8 border-l-0 hover:bg-[#84d17fc4] hover:text-[#388332c4]
                   text-white border-[#388332c4] border-2 px-2 rounded-r-md relative"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label>Appointment type</label>
                <select
                  className="w-full rounded-md h-8 border-slate-400 border-2"
                  onChange={(e) => setType(e.target.value)}
                >
                  <option key="1">Show all</option>
                  <option key="2">Online Consult</option>
                  <option key="3">Face to face Consult</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label>sort created book date by</label>
                <select
                  className="w-full rounded-md h-8 border-slate-400 border-2"
                  onChange={(e) => setCreated(e.target.value)}
                >
                  <option key="1">descending</option>
                  <option key="2">ascending</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label>Search by Scheduled Date</label>
                <div className="flex items-center">
                  <input
                    type="date"
                    value={time}
                    className="w-fit px-3 rounded-md border-slate-400 border-2"
                    onChange={(e) => settime(e.target.value)}
                  />
                  <button
                    onClick={() => settime("")}
                    className="bg-[#60af5ac4] ml-1 hover:bg-[#84d17fc4] hover:text-[#388332c4]
                   text-white border-[#388332c4] border-2 px-2 rounded-md "
                  >
                    reset date
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <label>status</label>
                <select
                  className="w-full rounded-md h-8 border-slate-400 border-2"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option key="1">Show all</option>
                  {filt.map((item, i) => {
                    if (
                      item.status !== "Completed" &&
                      item.status !== "rejected" &&
                      !bookSet.has(item.status)
                    ) {
                      bookSet.add(item.status);
                      return <option key={i}>{item.status}</option>;
                    }
                    return null;
                  })}
                </select>
              </div>
              <div className="flex flex-col">
                <label>Booked by someone</label>
                <select
                  className="w-full rounded-md h-8 border-slate-400 border-2"
                  onChange={(e) => setSomeone(e.target.value)}
                >
                  <option key="1">Show all</option>
                  <option key="2">Yes</option>
                  <option key="3">No</option>
                </select>
              </div>
            </div>
          </div>
          <div className=" flex justify-center">
            <div
              className="w-full h-auto min-h-screen text-sm flex mt-3 mb-10 flex-wrap justify-between
           rounded-lg text-gray-500 dark:text-gray-400"
            >
              {searchLoad ? (
                <AppconfirmPaginated
                  books={books}
                  user={user}
                  setBookID={setBookID}
                  CDNURL={CDNURL}
                  setLoaded={setLoaded}
                  Loaded={Loaded}
                  setCancel={setCancel}
                />
              ) : (
                <div className="w-full flex justify-center mt-20">
                  <MagnifyingGlass
                    visible={true}
                    width="50"
                    ariaLabel="MagnifyingGlass-loading"
                    wrapperStyle={{}}
                    wrapperClass="MagnifyingGlass-wrapper"
                    glassColor="#c0efffb7"
                    color="#388332c4"
                  />
                  <p className="text-2xl text-slate-600">Searching</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentConfirmation;
