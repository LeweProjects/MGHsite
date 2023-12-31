import doc from "../images/doc.jpg";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import { HiOutlineInformationCircle } from "react-icons/hi";
import supabase from "../config/Supabase";

const SearchResult = ({ Doctors }) => {
  const CDNURL =
    "https://iniadwocuptwhvsjrcrw.supabase.co/storage/v1/object/public/images/";

  //*image
  const id = Doctors.email;
  const [imgName, setimgName] = useState([]);
  const [isImgEmpty, setImgEmpty] = useState(false);

  async function getImages() {
    const { data, error } = await supabase.storage
      .from("images")
      .list(id + "/profile/", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "asc" },
      });

    if (data[0]) {
      setImgEmpty(true);
      setimgName(data[0].name);
    }

    if (error) {
      setImgEmpty(false);
      console.log(error);
    }
  }
  useEffect(() => {
    if (Doctors) {
      getImages(id, setimgName, setImgEmpty);
    }
  }, [Doctors, id, setImgEmpty, setimgName]);
  useEffect(() => {
    Aos.init({ duration: 1000 });
  }, []);

  return (
    <div key={Doctors.id} className="Doc_Uniq">
      <div
        data-aos="fade-up"
        className="docs text-sm bg-[#e2ffe3] border-2 border-[#8bc586] px-3 py-5 h-[98%] rounded-xl flex flex-col
         items-center w-[16rem] transition duration-100 ease-in-out mb-1"
      >
        <img
          src={`${
            isImgEmpty
              ? CDNURL + Doctors.email + "/profile/" + imgName
              : "https://iniadwocuptwhvsjrcrw.supabase.co/storage/v1/object/public/images/doc.jpg"
          }`}
          alt="/"
          className="w-[15rem] h-full object-cover max-2xl:w-[13rem] max-sm:w-[10rem] max-sm:mb-3 mb-6 rounded-lg"
        />
        <div className="flex">
          <span className="mr-2 font-bold">Name:</span>
          <p className="text-base valueDoc">{Doctors.name}</p>
        </div>
        <div className="flex">
          <span className="mr-2 font-bold">Specialization: </span>{" "}
          <p className="w-28 text-base valueDoc whitespace-nowrap overflow-hidden overflow-ellipsis">
            {Doctors.specialization}
          </p>
        </div>
        <div className="flex">
          <span className="mr-2 font-bold overflow whitespace-nowrap">
            Sub-Special:{" "}
          </span>{" "}
          <p className="w-32 text-base valueDoc whitespace-nowrap overflow-hidden overflow-ellipsis">
            {Doctors.subspecial}
          </p>
        </div>
        <div className="flex flex-col w-full items-center">
          <span className="mr-2 font-semibold text-slate-100 w-full bg-[#51b348] my-2 flex justify-center">
            Schedule
          </span>
          <div className="mb-2 flex">
            {Doctors.schedule &&
              Doctors.schedule.map((item) => (
                <p className="p-2 rounded-sm mr-2 mb-2 bg-opacity-40 text-slate-900 bg-[#67a76c]">
                  {item.day === "Thursday" ? "Th" : item.day === "Sunday" ? "Su" : item.day[0]}
                </p>
              ))}
          </div>
        </div>
        <Link to={"/DoctorInfo/" + Doctors.id}>
          <button className="flex text-base bg-[#418D3F] Docbtn p-2 rounded-md text-white font-bold ring-[#418D3F] ring-2 transition duration-75 ease-in hover:bg-[#A5DD9D] hover:text-[#267124]">
            <HiOutlineInformationCircle className="mr-1" size={23} /> Check
            Information
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SearchResult;
