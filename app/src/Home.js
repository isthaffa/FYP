import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';

import './App.scss';
import BodyContainer from './components/BodyContainer/BodyContainer.js';
import Footer from './components/Footer/Footer.js';
import Header from './components/Header/Header.js';

import 'normalize.css/normalize.css'; //NP, Resettar alla browsers default grejer
import cameraIcon from './assets/icons/camera-icon.png';
import checkIcon from './assets/icons/check-icon.png';
import crossIcon from './assets/icons/cross-icon.png';
import signPerson from './assets/images/sign-person-overlay.png';

import mlModel from './components/BodyContainer/model.json';
import WebCaptureResult from './components/WebCaptureResult';
import NavBar from './components/NavBar';

const letters = {
  ah: 'අ',
  ahh: 'ආ',
  aeh: 'ඇ',
  ee: 'ඉ',
  eeh: 'ඊ',
  uh: 'උ',
  uhh: 'ඌ',
  a: 'එ',
  ae: 'ඒ',
  o: 'ඔ',
  ohh: 'ඕ',
  k: 'ක්',
  ig: 'ග්',
  t: 'ටී',
};

const Home = () => {
  const webcamRef = useRef(null);

  const [webcamSelected, setWebcamSelected] = useState(false);
  const [webcamCapture, setWebcamCapture] = useState(null);
  const [photoUsed, setPhotoUsed] = useState(false);

  const [mobileNetModel, setMobileNetModel] = useState(null);
  const [knnClassifierModel, setKnnClassifierModel] = useState(null);

  const [result, setResult] = useState(null);

  useEffect(() => {
    const createKNNClassifier = async () => {
      console.log('Loading KNN Classifier');
      return await knnClassifier.create();
    };

    const createMobileNetModel = async () => {
      console.log('Loading Mobilenet Model');
      return await mobilenet.load();
    };

    const initializeModels = async () => {
      setMobileNetModel(await createMobileNetModel());
      setKnnClassifierModel(await createKNNClassifier());
    };

    const startWebcam = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          const video = webcamRef.current;
          video.srcObject = stream;
          video.play();
        })
        .catch((error) => {
          console.error('Error accessing webcam:', error);
        });
    };

    startWebcam();
    initializeModels();
  }, []);

  // side effect to load model
  useEffect(() => {
    (async () => {
      if (!knnClassifierModel || !mobileNetModel) {
        return;
      }
      const loadedModel = mlModel;

      Object.keys(loadedModel).forEach((key) => {
        loadedModel[key] = tf.tensor(loadedModel[key], [
          loadedModel[key].length / 1024,
          1024,
        ]);
      });
      knnClassifierModel.setClassifierDataset(loadedModel);
      console.log('classifier has been set up!');
    })();
  }, [knnClassifierModel, mobileNetModel]);

  const loadImageFromBase64 = async (base64Data) => {
    const img = new Image();
    img.src = base64Data;

    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Convert the canvas to a tensor using tf.browser.fromPixels()
        const tensor = tf.browser.fromPixels(canvas);

        resolve(tensor);
      };
    });
  };

  const imageClassificationWithTransferLearningOnWebcam = async () => {
    if (knnClassifierModel.getNumClasses() > 0) {
      const img = await loadImageFromBase64(webcamCapture);
      const activation = mobileNetModel.infer(img, 'conv_preds');
      const predictedResult = await knnClassifierModel.predictClass(activation);
      if (predictedResult) {
        setResult(predictedResult);
      }
    }
    await tf.nextFrame();
  };

  const startWebcam = () => {
    setWebcamSelected(true);
  };

  const toggleOffWebcamMode = () => {
    setWebcamSelected(false);
    setPhotoUsed(false);
  };

  const takeSnaphotFromWebcam = () => {
    let screenshot = webcamRef.current.getScreenshot();
    setWebcamCapture(screenshot);
  };

  const usePhoto = () => {
    setPhotoUsed(true);
    imageClassificationWithTransferLearningOnWebcam();
  };

  const renderWebcamCapture = () => {
    return (
      <div className="webcam-frame-container">
        <p className="header__big-title">Webcam</p>
        {webcamCapture ? (
          <div>
            <img alt="webcam capture" src={webcamCapture} />
          </div>
        ) : (
          <>
            <img
              alt="signPerson"
              className="sign-person-overlay"
              src={signPerson}
            />
            <Webcam
              audio={false}
              height={450}
              mirrored={false}
              ref={webcamRef}
              screenshotFormat="image/jpg"
              width={800}
            />
          </>
        )}
        <div className="buttons-container">
          {!webcamCapture && (
            <>
              <button
                className="upload-file__button"
                onClick={takeSnaphotFromWebcam}
              >
                Capture Photo{' '}
                <img
                  style={{ marginLeft: '10px' }}
                  height="20px"
                  alt="upload icon"
                  src={cameraIcon}
                />
              </button>
              <button
                type="button"
                className="upload-file__button upload-file__button-grey"
                onClick={toggleOffWebcamMode}
              >
                Back{' '}
              </button>
            </>
          )}
          {webcamCapture && (
            <button
              className="upload-file__button upload-file__button-red"
              onClick={() => setWebcamCapture(null)}
            >
              Retake Photo{' '}
              <img
                style={{ marginLeft: '10px' }}
                height="15px"
                alt="upload icon"
                src={crossIcon}
              />
            </button>
          )}
          {webcamCapture && (
            <button className="upload-file__button" onClick={usePhoto}>
              Use this Photo{' '}
              <img
                style={{ marginLeft: '10px' }}
                height="20px"
                alt="upload icon"
                src={checkIcon}
              />{' '}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <NavBar />
      <div className="app__container">
        {webcamSelected && !photoUsed && <>{renderWebcamCapture()}</>}

        {photoUsed && (
          <>
            <WebCaptureResult
              toggleOffWebcamMode={toggleOffWebcamMode}
              webcamCapture={webcamCapture}
              result={result}
            />
          </>
        )}

        {!webcamSelected && !photoUsed && (
          <div>
            <Header />
            <BodyContainer
              webcamCapture={webcamCapture}
              startWebcam={startWebcam}
            />
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Home;
