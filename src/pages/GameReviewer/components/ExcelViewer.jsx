import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const ExcelViewer = ({ file }) => {
  const [data, setData] = useState([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [sheetNames, setSheetNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExcel = async () => {
      try {
        const response = await fetch(file);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          setSheetNames(workbook.SheetNames);
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          setData(jsonData);
          setIsLoading(false);
        };

        reader.readAsArrayBuffer(blob);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchExcel();
  }, [file]);

  const handleSheetChange = async (index) => {
    try {
      const response = await fetch(file);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[index]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        setData(jsonData);
        setActiveSheet(index);
      };

      reader.readAsArrayBuffer(blob);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col">
      <div className="flex gap-2 p-4 bg-gray-100">
        {sheetNames.map((name, index) => (
          <button
            key={name}
            onClick={() => handleSheetChange(index)}
            className={`px-4 py-2 rounded ${
              activeSheet === index
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <table className="min-w-full border-collapse">
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50' : ''}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border border-gray-200 px-4 py-2 whitespace-nowrap"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelViewer;