import React, { useEffect, useState } from 'react';
import quotedPrintable from 'quoted-printable'
import QRCode from 'qrcode.react';
import vCardsJS from 'vcards-js';
import { saveAs } from 'file-saver';

export const CardInfo = () => {
  const [employeesData, setEmployeesData] = useState(null);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [vCardUrl, setVCardUrl] = useState(null);

  useEffect(() => {
    const generateAndSetVCard = async () => {
      try {
        if (currentEmployee && currentEmployee.photo) {
          const vCardUrl = await generateVCard(currentEmployee);
          setVCardUrl(vCardUrl);
        }
      } catch (error) {
        console.error('Error al generar la vCard:', error);
      }
    };

    generateAndSetVCard();
  }, [currentEmployee]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://demodata.grapecity.com/northwind/api/v1/Employees');
        const data = await response.json();
        setEmployeesData(data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchData();
  }, []);

  const decodeBase64Image = (base64String, bytesToSkip) => {
    const binaryString = window.atob(base64String);
    const bytes = new Uint8Array(binaryString.length - bytesToSkip);

    for (let i = bytesToSkip; i < binaryString.length; i++) {
      bytes[i - bytesToSkip] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'image/bmp' });

    return URL.createObjectURL(blob);
  };

  const bmpToJpeg = async (bmpData) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Cuando la imagen esté cargada, se realizará la conversión
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convertir la imagen a formato JPEG
        const jpegData = canvas.toDataURL('image/jpeg');
        resolve(jpegData);
      };

      img.src = `${bmpData}`;
    });
  };

  // async function blobToBase64(blob) {
  //   const reader = new FileReader();

  //   return new Promise((resolve, reject) => {
  //     reader.onloadend = () => {
  //       const base64String = reader.result.split(',')[1];
  //       resolve(base64String);
  //     };

  //     reader.onerror = reject;
  //     reader.readAsDataURL(blob);
  //   });
  // }





  const generateVCard = async (employeeData) => {
    try {
      // Obtener la imagen en formato base64
      const imageUrl = decodeBase64Image(employeeData.photo, 78);
      //const jpegImage = await bmpToJpeg(imageUrl)

      // Aplicar Quoted-Printable al nombre
      const nombre = quotedPrintable.encode(`${employeeData.firstName} ${employeeData.lastName}`);

      // Construir la cadena vCard
      const vCardData =
        `BEGIN:VCARD
        VERSION:2.1
        FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${nombre}
        ORG;CHARSET=UTF-8:${employeeData.country}
        ${qrCodeVisible ? '' : `PHOTO;CHARSET=UTF-8;ENCODING=BASE64:${await bmpToJpeg(imageUrl)}`} 
        TEL:${employeeData.homePhone}
        ${employeeData.email ? `EMAIL:${employeeData.email}` : ''}
  
  END:VCARD`;

      // Devolver la URI
      return encodeURI(`data:text/vcard;charset=utf-8,${vCardData}`);
    } catch (error) {
      console.error('Error al generar la vCard:', error);
      throw error;
    }
  };



  const DownloadVCard = async (employeeData) => {
    //create a new vCard
    let vCard = vCardsJS();
    const imageUrl = decodeBase64Image(employeeData.photo, 78);
    //set properties
    vCard.firstName = `${ employeeData.firstName}`
    vCard.lastName = `${employeeData.lastName}`
    vCard.organization = `${employeeData.country}`
    vCard.workPhone = `${employeeData.homePhone}`
    vCard.photo.embedFromString(`${await bmpToJpeg(imageUrl)}`, 'image/jpeg');
  
    //create a Blob from the vCard data
    var blob = new Blob([vCard.getFormattedString()], {type: "text/vcard;charset=utf-8"});
    
    //use file-saver to save the file
    saveAs(blob, `${employeeData.firstName} ${employeeData.lastName}.vcf`);
  }
  

  const handleDownloadVCard = (employeeData) => {
    generateVCard(employeeData)
      .then(vCardData => {
        //console.log(vCardData);

        // Crear un blob con la información vCard
        const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });

        // Crear un enlace temporal
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${employeeData.firstName} ${employeeData.lastName}.vcf`

        // Simular el clic en el enlace para iniciar la descarga
        document.body.appendChild(link);
        link.click();

        // Limpiar el enlace después de la descarga
        document.body.removeChild(link);
      })
      .catch(error => console.error(error));
  };

  const handleDownload = async (photo, name) => {
    const fileName = `${name}.jpeg`;
    const imageUrl = decodeBase64Image(photo, 78);
    const jpegImage = await bmpToJpeg(imageUrl);

    // Crear un enlace temporal
    const link = document.createElement('a');
    link.href = jpegImage;
    link.download = fileName;

    // Simular el clic en el enlace para iniciar la descarga
    document.body.appendChild(link);
    link.click();

    // Limpiar el enlace después de la descarga
    document.body.removeChild(link);
  };

  const showQrCode = (employeeData) => {
    setCurrentEmployee(employeeData);
    console.log(employeeData);
    setQrCodeVisible(true);
    //console.log('qrCodeVisilbe: ',qrCodeVisible);
  };

  const hideQrCode = () => {
    setCurrentEmployee(null);
    setQrCodeVisible(false);
    //console.log('hideQrCode');
  };



  return (
    <>
      <h1 className='mt-4 text-center text-2xl text-black font-semibold'>Employees List</h1>
      <div className='container mx-auto'>
        <div className='flex flex-wrap'>
          {employeesData !== null ? (
            employeesData.map((employeeData) => {
              //const vCardUrl = generateVCard(employeeData);
              return (
                <div key={employeeData.employeeId} className="mt-4 py-6 px-6 max-w-lg mx-auto rounded-xl bg-white shadow-xl space-y-2 sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6">
                  <div className='flex flex-col items-center'>
                    <img
                      className="block mx-auto h-44 rounded-xl sm:mx-0 sm:shrink-0"
                      src={decodeBase64Image(employeeData.photo, 78)}
                      alt={`Photo of ${employeeData.firstName} ${employeeData.lastName}`}
                    />
                    {/* <div className="mt-4">
                      <QRCode value={vCardUrl} size={134} />
                    </div> */}
                  </div>

                  <div className="text-center space-y-2 sm:text-left">
                    <div className="space-y-0.5">
                      <p className="text-lg text-black font-semibold">{`${employeeData.firstName} ${employeeData.lastName}`}</p>
                      {/* <p> {quotedPrintable.encode(`${employeeData.firstName} ${employeeData.lastName}`)}</p> */}
                      <p className="text-slate-500 font-medium"><strong>Title: </strong>{`${employeeData.title}`}</p>
                      <p className="text-slate-500 font-medium"><strong>Phone: </strong>{`${employeeData.homePhone}`}</p>
                      <p className="text-slate-500 font-medium"><strong>Country: </strong>{`${employeeData.country}`}</p>
                      <p className="text-slate-500 font-medium"><strong>City: </strong>{`${employeeData.city}`}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(employeeData.photo, `${employeeData.firstName} ${employeeData.lastName}`)}
                      className="px-4 py-1 text-sm text-purple-800 font-semibold rounded-full border-2 border-purple-300 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                    >
                      Img
                    </button>
                    <button
                      onClick={() => showQrCode(employeeData)}
                      className="ml-2 px-4 py-1 text-sm text-purple-800 font-semibold rounded-full border-2 border-purple-300 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                    >
                      QR Code
                    </button>
                    <button
                      onClick={() => DownloadVCard(employeeData)}
                      className="ml-2 px-4 py-1 text-sm text-purple-800 font-semibold rounded-full border-2 border-purple-300 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                    >
                      vCard
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div>
              <p>No hay datos</p>
            </div>
          )}
        </div>
      </div>
      {/* Ventana emergente para mostrar el código QR */}
      {qrCodeVisible && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full sm:max-w-lg"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    {/* Icono o contenido en el encabezado del modal */}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      QR Code
                    </h3>
                    <div className="mt-2">
                      <QRCode
                        value={vCardUrl} size={200} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={hideQrCode}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

};
