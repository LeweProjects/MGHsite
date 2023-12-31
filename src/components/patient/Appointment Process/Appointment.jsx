import React, { useEffect, useState } from "react";
import supabase from "../../config/Supabase";
import DocUniq from "../../Doctor read/Doctors";
import Specials from "../../Specials.json";
import SubSpecial from "../../SubSpecial.json";
import Aos from "aos";
import "aos/dist/aos.css";
import { TiThLargeOutline, TiThListOutline } from "react-icons/ti";
import DoctorInList from "../../Doctor read/DoctorInList";

const Appointment = () => {
  //TODO: Pagination

  //Search and reset Function
  const [Name, setName] = useState("");
  const [spSelect, setSpSelect] = useState("");
  const [subSelect, setSubSelect] = useState("");
  const [Doctors, setDoctors] = useState(null);
  const [Filter, setFilter] = useState([]);
  const [noResult, setNoResult] = useState(false);
  const [type, setType] = useState("");

  //select option value
  if (spSelect === "---") {
    setSpSelect("");
  }
  if (subSelect === "---") {
    setSubSelect("");
  }
  if (type === "---") {
    setType("");
  }
  console.log(type);
  // console.log(Name, spSelect, subSelect, Hmo)
  const [showFill, setShowFill] = useState(true);
  useEffect(() => {
    const fetchFilter = async () => {
      const { data, error } = await supabase.from("dr_information").select("*");
      if (error) {
        console.error("Failed to fetch", error.message);
      } else {
        if (data) {
          var filteredSuggest = data.filter((doctor) => {
            var nameMatch = Name
              ? doctor.name.toLowerCase().includes(Name.toLowerCase())
              : false;

            return nameMatch;
          });
          setFilter(filteredSuggest);
        }

        if (Name === "") {
          setFilter("");
        }
      }
    };
    fetchFilter();
  }, [Name]);

  const handleNameFilterClick = (clickedName) => {
    setName(clickedName);
    setShowFill(false);
    console.log(clickedName);
  };

  function handleNameChange(e) {
    setName(e.target.value);
    setShowFill(true);
  }
  //DEFAULT DATA
  const fetchDoc = async () => {
    const { data, error } = await supabase.from("dr_information").select("*");

    if (error) {
      setDoctors(null);
      console.log(error);
    }
    if (data) {
      return setDoctors(data);
    }
  };
  //*REAL TIME DOCTOR DATA
  useEffect(() => {
    fetchDoc();
    supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dr_information" },
        () => {
          fetchDoc();
        }
      )
      .subscribe();
  }, []);
  // RESET FUNCTION
  const handleReset = async () => {
    setName("");
    setSpSelect("---");
    setSubSelect("---");
    setType("---");

    const { data, error } = await supabase.from("dr_information").select("*");

    if (error) {
      console.error("Failed to fetch", error.message);
    }
    setDoctors(data);
    setNoResult(false);
  };

  //SEARCH FUNCTION
  const handleSearch = async () => {
    if (!Name && !spSelect && !subSelect && !type) {
      setNoResult(true);
    } else {
      setNoResult(false);

      const { data, error } = await supabase.from("dr_information").select("*");

      if (error) {
        console.error("Error searching for data:", error.message);
        return;
      }
      const filteredData = data.filter((doctor) => {
        const nameMatch = Name
          ? doctor.name.toLowerCase().includes(Name.toLowerCase())
          : true;
        const specMatch = spSelect
          ? doctor.specialization.toLowerCase().includes(spSelect.toLowerCase())
          : true;
        const subSpecMatch = subSelect
          ? doctor.subspecial.toLowerCase().includes(subSelect.toLowerCase())
          : true;
        const typeMatch = type
          ? doctor.type
              .toLowerCase()
              .includes(type === "Face to Face Consult" ? "f2f" : "ol")
          : true;
        return nameMatch && specMatch && subSpecMatch && typeMatch;
      });
      setDoctors(filteredData);
      if (filteredData.length === 0) {
        setNoResult(true);
        setDoctors("");
      } else {
        setNoResult(false);
      }
    }
  };
  useEffect(() => {
    Aos.init({ duration: 500 });
  }, []);

  //*Tiles or list
  const [isList, setIsList] = useState(false);

  return (
    <div className="back items-center flex flex-col h-auto min-h-screen">
      <div
        className="hero2 px-28 py-28 max-sm:px-10 max-sm:py-10 max-sm:space-y-4 flex flex-col text-center items-center text-white space-y-14 w-full"
        data-aos="fade-up"
      >
        <p
          className="text-5xl max-sm:text-3xl font-semibold"
          data-aos="fade-up"
        >
          RESERVE AN APPOINTMENT NOW!
        </p>
        <p
          className="text-3xl max-sm:text-lg font-light whitespace-nowrap"
          data-aos="fade-up"
        >
          Let us assist your appointment either online or onsite.
        </p>
      </div>

      <div className="grid grid-cols-4 w-full justify-center mt-10 mb-9 items-end">
        <div className=""></div>
        <div className="flex flex-col col-span-2 items-center">
          <h1
            className="text-4xl font-semibold text-[#315E30] mb-10"
            data-aos="fade-up"
          >
            Find a Doctor
          </h1>
          <div
            className="find bg-white flex items-center search_box flex-col px-10 outbox py-8 rounded-md"
            data-aos="zoom-in-up"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="grid grid-cols-4 containtsearch">
                <div className="text-xl text-[#315E30]">
                  <p className="search_label">Doctor's Name</p>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    className="py-1 mr-6 serachInput text-base bg-white border-2 border-r-transparent border-t-transparent border-l-transparent focus:outline-none 
                        focus:border-b-[#315E30]"
                    value={Name}
                    onChange={handleNameChange}
                  />
                  {showFill && Filter && (
                    <div className="absolute abs w-48 flex flex-wrap text-sm bg-white z-50">
                      {Filter.map((Filter) => (
                        <li
                          onClick={() => handleNameFilterClick(Filter.name)}
                          className="list-none px-2 my-1 cursor-pointer w-full hover:bg-primary hover:text-white"
                          key={Filter.id}
                        >
                          {Filter.name}
                        </li>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xl text-[#315E30]">
                  <p className="search_label">Specialization</p>
                  <div className="flex mr-10">
                    {/* Specialization Dropdown */}
                    <select
                      className="w-44 py-2 text-base serachInput duration-100 border-b-2 focus:outline-[#315E30]"
                      value={spSelect}
                      onChange={(e) => setSpSelect(e.target.value)}
                    >
                      {Specials.map((Spec) => {
                        return (
                          <option key={Spec.id}>{Spec.Specialization}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="text-xl text-[#315E30]">
                  <p className="search_label">Sub-Specialization</p>
                  <div className="flex mr-10">
                    {/* Sub-Specialization Dropdown */}
                    <select
                      id="finddoctor-form-subspec"
                      value={subSelect}
                      onChange={(e) => setSubSelect(e.target.value)}
                      className="w-44 py-2 text-base serachInput duration-100 border-b-2 focus:outline-[#315E30]"
                    >
                      <option key="">---</option>
                      {SubSpecial.map((subspec) => {
                        return (
                          <option key={subspec.id}>
                            {subspec.SubSpecialization}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="text-xl text-[#315E30]">
                  <p className="search_label">Consultation Type</p>
                  {/* Type select */}
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="py-2 serachInput w-48 text-base bg-white border-2 border-r-transparent border-t-transparent border-l-transparent focus:outline-none 
                focus:border-b-[#315E30]"
                  >
                    <option id="0">---</option>
                    <option id="1">Face to Face Consult</option>
                    <option id="2">Online Consult</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                data-aos-anchor-placement="top-bottom"
                data-aos="fade-up"
                onClick={handleSearch}
                className="bg-[#418D3F] searchbutton w-2/5 py-1 font-semibold text-xl text-white rounded-md transition duration-10 ease-in-out hover:bg-[#A5DD9D] hover:text-[#267124] hover:ring-[#418D3F] hover:ring-[3px]"
              >
                SEARCH
              </button>
              <button
                data-aos-anchor-placement="top-bottom"
                data-aos="fade-up"
                onClick={handleReset}
                className="text-[#267124] resetbutton text-lg"
              >
                reset
              </button>
            </div>
          </div>
        </div>
        <div className="flex ml-8 text-4xl text-green-800 space-x-3">
          <div className=""></div>

          <TiThLargeOutline
            onClick={() => setIsList(false)}
            className={`${
              !isList && "bg-[#7bbb7ec0]"
            } p-[6px] cursor-pointer rounded-md bg-[#9beb9fc0] shadow-lg transition duration-75 hover:bg-[#7bbb7ec0]`}
          />
          <TiThListOutline
            onClick={() => setIsList(true)}
            className={`${
              isList && "bg-[#7bbb7ec0]"
            } p-[6px] cursor-pointer rounded-md bg-[#9beb9fc0] shadow-lg transition duration-75 hover:bg-[#7bbb7ec0]`}
          />
        </div>
      </div>

      {noResult && (
        <p
          className="grid grid-flow-col gap-x-12 py-8 text-2xl font-semibold text-[#1c531b]"
          data-aos="fade-down"
        >
          No results found
        </p>
      )}
      {!isList && (
        <div className="grid -z-[0] md:grid-cols-3 max-[844px]:grid-cols-2 mx-auto justify-center max-sm:gap-y-0 xl:grid-cols-4 gap-x-10 gap-y-2">
          {Doctors?.map((Doctors) => (
            <DocUniq key={Doctors.id} Doctors={Doctors} />
          ))}
        </div>
      )}
      {isList && (
        <div className="flex flex-col w-[60%] space-y-2 mb-3 items-center">
          {Doctors?.map((Doctors) => (
            <DoctorInList key={Doctors.id} ol={Doctors}/>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointment;
