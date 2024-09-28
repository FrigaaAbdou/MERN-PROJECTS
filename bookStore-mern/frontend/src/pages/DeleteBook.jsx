import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import BackButton from "../components/backButton";

const DeleteBook = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const handelDeleteBook = () => {
    setLoading(true);
    axios
      .delete(`http://localhost:5555/books/${id}`)
      .then(() => {
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        alert("An erroer happened. please chech console");
        console.log(error);
      });
  };
  return (
    <div className="p-4 ">
      <BackButton />
      {loading ? <Spinner /> : ""}
      <div className="flex flex-col items-center border-2 border-sky-400 rounded-xl w-[600px] p-8 mx-auto">
        <h1 className="text-3xl my-4">Delete Book</h1>
        <h3 className="text-2xl">Are you sure you want to delete this book?</h3>

        <button
          onClick={handelDeleteBook}
          className="p-4 rounded-md bg-red-600 text-white m-8 w-full"
        >
          Yes, Delete it
        </button>
      </div>
    </div>
  );
};

export default DeleteBook;
