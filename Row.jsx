import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Row.css";

function Row({ title, fetchUrl }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(fetchUrl);
        setMovies(response.data || []);
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
      }
    }
    fetchData();
  }, [fetchUrl, title]);

  return (
    <div className="row">
      <h2>{title}</h2>

      <div className="row-posters">
        {movies.map((movie) => (
          <a
            key={movie.id}
            href={movie.trailer}
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="row-poster"
              src={movie.image}
              alt={movie.title}
            />
          </a>
        ))}
      </div>
    </div>
  );
}

export default Row;
