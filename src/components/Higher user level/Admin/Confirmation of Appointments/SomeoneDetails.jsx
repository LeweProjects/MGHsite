import React, { useEffect, useRef, useState } from "react";
import supabase from "../../../config/Supabase";
import { Oval } from "react-loader-spinner";

const SomeonDetails = ({ id, setSomeone, isSomeone }) => {
  const [user, setMedical] = useState();
  const [loading, setLoading] = useState(true);
  console.log(id);
  //*To read med history data based on user ID
  useEffect(() => {
    if (isSomeone && id) {
      const fetchData = async () => {
        const { data, error } = await supabase
          .from("patient_Appointments")
          .select("*")
          .eq("book_id", id)
          .single();

        if (error) {
          console.error("Error fetching data:", error);
        } else {
          setMedical(data);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isSomeone, id]);

  //*Closes modal when clicked outside
  let medRef = useRef();
  useEffect(() => {
    let handler = (e) => {
      if (!medRef.current.contains(e.target)) {
        setSomeone(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [setSomeone]);
  return (
    <div className="flex justify-center backdrop-blur-sm bg-slate-700 fixed z-50 inset-0 bg-opacity-30">
      <div
        onClick={(e) => e.stopPropagation()}
        ref={medRef}
        className="abs absolute overflow-y-auto mt-40 p-8 rounded-lg bg-white"
      >
        {loading ? (
          <Oval
            height={80}
            width={80}
            color="#4fa94d"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#4fa94d"
            strokeWidth={2}
            strokeWidthSecondary={2}
          />
        ) : (
          <>{user.email}</>
        )}
      </div>
    </div>
  );
};

export default SomeonDetails;
