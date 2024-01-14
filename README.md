# React App Northwind Employees List

En esta app, se hace un fetch de esta url, donde esta publicada la base de datos northwind por lo que no es necesario acceso a un servidor mssql: https://demodata.grapecity.com/northwind/api/v1/Employees

la base de datos tiene imagenes incrustadas como blob, que requirieron un especial tratamiento para poder visulizarlas, es un modelo antiguo, que se usaba con tecnologias microsoft y OLE. Estan en formato BMP y cuando se descargan se convierten a JPEG.

El QR code aun muestra datos en formato URI, espero mejorar esto en la segunda version. El archivo de contactos vCard ya funciona bien y se puede usar en Android y Windows.

El componente tiene todo el codigo y la logica incrustada, por lo que falta desagregarlo en hooks y helpers, esto lo dejo para la segunda version tambien.

App corriendo en Netlify: https://northwind-employees-list.netlify.app/



Me ayudo mucho en el aprendizaje y practicas con Reactjs, por lo que expreso un especial agradecimiento a las excelentes Clases del Profesor del canal de Youtube Sergie Code, Dejo el link de su curso en español por si alguien lo quiere seguir:
https://www.youtube.com/watch?v=ladwC6Lrs-M&t=23510s