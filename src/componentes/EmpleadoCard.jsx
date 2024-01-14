import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode.react'

export const EmpleadoCard = () => {
  const [employeesData, setEmployeesData] = useState(null);
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://demodata.grapecity.com/northwind/api/v1/Employees');
        const data = await response.json();
        setEmployeesData(data);
        //console.log(data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    
    fetchData();
  }, []);
  
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const decodeBase64Image = (base64String, bytesToSkip) => {
    //console.log(base64String);
    const binaryString = window.atob(base64String);
    const bytes = new Uint8Array(binaryString.length - bytesToSkip);

    for (let i = bytesToSkip; i < binaryString.length; i++) {
      bytes[i - bytesToSkip] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'image/bmp' });
    const base64Data = blobToBase64(blob);
    const jpegImage = bmpToJpeg(base64Data);

    return URL.createObjectURL(jpegImage);
    //return jpegImage
  };
  
  const generateVCard = (employeeData) => {
    const vCard = `BEGIN:VCARD
  VERSION:3.0
  FN:${employeeData.firstName} ${employeeData.lastName}
  ORG:${employeeData.country}
  TEL:${employeeData.homePhone}
  ${employeeData.email ? `EMAIL:${employeeData.email}` : ''}
  PHOTO;MEDIATYPE=image/bmp:${decodeBase64Image(employeeData.photo, 78)}
  END:VCARD`;
  
    return encodeURI(`data:text/vcard;charset=utf-8,${vCard}`);
  };
     
  const handleDownload = (photo, name) => {
    const fileName = `${name}.bmp`;
    const imageUrl = decodeBase64Image(photo, 78);
    
    // Crear un enlace temporal
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;

    // Simular el clic en el enlace para iniciar la descarga
    document.body.appendChild(link);
    link.click();

    // Limpiar el enlace después de la descarga
    document.body.removeChild(link);
  };

  const handleCompartir = (employeeData) => {
    const vCardUrl = generateVCard(employeeData);
    console.log('URL del vCard:', vCardUrl);
        // Crear un enlace temporal
        const link = document.createElement('a');
        link.href = vCardUrl;
        //link.download = fileName;
    
        // Simular el clic en el enlace para iniciar la descarga
        document.body.appendChild(link);
        link.click();
  };

  const bmpToJpeg = (bmpData) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = `data:image/bmp;base64,${bmpData}`;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    // Convertir la imagen a formato JPEG
    const jpegData = canvas.toDataURL('image/jpeg');
    return jpegData;
  };

  return (
    <>
      <h1 className='mt-4 text-center text-2xl text-black font-semibold'>Employees List</h1>
      <div className='container mx-auto'>
        <div className='flex flex-wrap'>
          {employeesData !== null ? (
            employeesData.map((employeeData) => {
              const vCardUrl = generateVCard(employeeData) // Definir vCardUrl aquí
              return (
              <div key={employeeData.employeeId} className="mt-4 py-6 px-6 max-w-lg mx-auto rounded-xl bg-white shadow-xl space-y-2 sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6">
                <div className='flex flex-col items-center'>
                <img
                  className="block mx-auto h-44 rounded-xl sm:mx-0 sm:shrink-0"
                  src={decodeBase64Image(employeeData.photo, 78)}
                  alt={`Photo of ${employeeData.firstName} ${employeeData.lastName}`}
                />
                <div className="mt-4">
                <QRCode value={vCardUrl} size={134} /></div>
                </div>

                <div className="text-center space-y-2 sm:text-left">
                  <div className="space-y-0.5">
                    <p className="text-lg text-black font-semibold">{`${employeeData.firstName} ${employeeData.lastName}`}</p>
                    <p className="text-slate-500 font-medium"><strong>Title: </strong>{`${employeeData.title}`}</p>
                    <p className="text-slate-500 font-medium"><strong>Phone: </strong>{`${employeeData.homePhone}`}</p>
                    <p className="text-slate-500 font-medium"><strong>Country: </strong>{`${employeeData.country}`}</p>
                    <p className="text-slate-500 font-medium"><strong>City: </strong>{`${employeeData.city}`}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(employeeData.photo, `${employeeData.firstName} ${employeeData.lastName}`)}
                    
                    className="px-4 py-1 text-sm text-purple-800 font-semibold rounded-full border-2 border-purple-300 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                    >
                    Download Img
                  </button>
                  <button
                    onClick={() => handleCompartir(employeeData)}
                    className="ml-2 px-4 py-1 text-sm text-purple-800 font-semibold rounded-full border-2 border-purple-300 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                    >
                    Compartir
                  </button>
                </div>
              </div>
              )
             })
            ) : (
            <div>
              <p>Cargando... </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
