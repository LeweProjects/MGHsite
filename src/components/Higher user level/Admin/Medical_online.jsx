import React, { useEffect, useRef, useState } from "react";
import supabase from "../../config/Supabase";
import { CircleLoader } from "react-spinners";

const Medical_online = ({ setMedModal, id, MedModal }) => {
  const [medical, setMedical] = useState([]);
  const [loading, setLoading] = useState(true);
  //*To read med history data based on user ID
  useEffect(() => {
    if (MedModal && id) {
      const fetchData = async () => {
        const { data, error } = await supabase
          .from("Online_Appointments")
          .select("*")
          .eq("online_id", id)
          .single();

        if (error) {
          console.error("Error fetching data:", error);
        } else {
          setMedical(data.medicalhistory);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [MedModal, id]);

  //*Closes modal when clicked outside
  let medRef = useRef();
  useEffect(() => {
    let handler = (e) => {
      if (!medRef.current.contains(e.target)) {
        setMedModal(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [setMedModal]);
  return (
    <div className="flex justify-center backdrop-blur-sm bg-slate-700 fixed z-50 inset-0 bg-opacity-30">
      <div
        onClick={(e) => e.stopPropagation()}
        ref={medRef}
        className="abs absolute overflow-y-auto mt-40 p-8 bg-white"
      >
        {loading ? (
          <CircleLoader color="#36d7b7" size={45} />
        ) : (
          <>
            {" "}
            {medical.map((item) => (
              <div key={item} className="flex flex-col">
                <p>{item}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Medical_online;
