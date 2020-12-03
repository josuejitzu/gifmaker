import React, { useState, useEffect } from 'react';
import './App.css';
import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({log:true});//esto es una propiedad para ver todo lo de FFmpeg en la consola
function App() {

  const[ready,setReady] = useState(false);
  const[video,setVideo] = useState();
  const[gif,setGif] = useState();
  const[videProRes,setVideoProRes] = useState();

  const load = async() =>{
    await ffmpeg.load();
    setReady(true);
  
  }

  useEffect(()=>{

    load();
  },[])//los bracket hacen que solo corra una vez 


  const convertToGif = async() =>{
    //Ordenamos escribir el archivo a memoria, si el explorador recarga la pagina se pierde
    ffmpeg.FS('writeFile','test.mp4',await fetchFile(video));//FS es filysystem , writeFile es el comando para escribir un archivo, 

    //Comando FFMpeg en crudo, ve la documentacion para mas informacion 
    //-i(input) el archivo ,-t es el tiempo de duracion del archivo final, -ss es offset desde donde inicia, -f = gif tipo de archivo, finalmente el nombre del archivo
    await ffmpeg.run('-i','test.mp4','-t','3.5','-ss','2.0','-f','gif','out.gif');
    //-i ${DPX_HERO} -probesize 5000000 -f image2 -r $48 -force_fps -i ${DPX_2ND} -c:v libx264 -profile:v main -g 1 -tune stillimage -crf 9 -bf 0 -vendor apl0 -pix_fmt yuv420p -s 2048x1152 -r 48 -map 0:0 -map 1:0 -metadata stereo_mode=left_right output.mov

    //Leemos el resultado de la memoria y lo asignamos a una var
    const data = ffmpeg.FS('readFile','out.gif');
    //Creamos una url del video que sera usada para desplegarla en la pagina, new Blob es un objeto raw data, en este caso data es un binario y Blob necesita saber a que tipo queremos convertir o sea gif 
    const url = URL.createObjectURL(new Blob([data.buffer],{type:"image/gif"}));
    
    setGif(url);
  }
  const convertirProRes = async() =>{

    ffmpeg.FS('writeFile','test.mov',await fetchFile(video));

    await ffmpeg.run('-i','test.mov', '-c:v','prores_ks','-profile:v','3','-c:a','pcm_s16le','output.mov');

    const data = ffmpeg.FS('readFile','output.mov');
     const url = URL.createObjectURL(new Blob([data.buffer],{type:"video/mov"}));
     setVideoProRes(url);
  }

  return ready? (//si la variable ready = false muestra Loading, vamos a usar el formato ? true:false
    <div className="App">
      {video && <video
                  controls
                  width ="250"
                  src={URL.createObjectURL(video)}>

      </video>}
      {/* aqui creamos un boton input y se lo mandamos al state video, puden ser varios videos */}
      <input type="file" onChange={(e)=>setVideo(e.target.files?.item(0))}/> 
      <p></p>
      <button onClick={convertToGif}>Convertir A GIF</button>
      <p></p>
      <button onClick={convertirProRes}>Convertir A ProRes</button>

      <h3>Resultado</h3>
     

      {gif && <img width="250" src={gif}/>}
      <p></p>
      {/* {videProRes && <video width="500"src={videProRes} />} */}
      {videProRes && <a href={videProRes} target="_blank">Descargar ProRes</a>}


     
    </div>
  ):(<p>Loading...</p>);
}

export default App;
