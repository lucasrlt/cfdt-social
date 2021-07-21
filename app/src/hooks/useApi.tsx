import React, { useState, useEffect } from 'react';
import axios from 'axios';

const useApi = (url, initialData = [], method = 'get', reqData = {}) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  // const dispatchError = useDispatchError();

  const fetchData = async (reqData2 = reqData) => {
    try {
      setIsLoading(true);
      const options = {
        url, method
      }

      if (method.toLowerCase() !== "get") {
        options.data = reqData2;
      }

      const result = await axios(options);

      setData(result.data);
      setIsLoading(false);
    } catch (err) {
      console.log(err.toJSON());
      // dispatchError(err.response.data);
      return err;
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return [data, isLoading, fetchData, setData];
};

export default useApi;
