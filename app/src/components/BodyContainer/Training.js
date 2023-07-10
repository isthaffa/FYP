import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import React, { useEffect, useRef, useState } from 'react';

import sampleModel from './model.json';

const letters = {
  ah: 'අ',
  aah: 'ආ',
  aeh: 'ඇ',
  ee: 'ඉ',
  eeh: 'ඊ',
  uh: 'උ',
  uhh: 'ඌ',
  a: 'එ',
  ae: 'ඒ',
  o: 'ඔ',
  oh: 'ඕ',
  k: 'ක්',
  ig: 'ග්',
  t: 'ටී',
};

const TrainingPage = () => {
  const webcamRef = useRef(null);
  const [identity, setIdentity] = useState(0);
  const [classes, setClasses] = useState([]);
  const [uploadedModel, setUploadedModel] = useState(false);
  const predictionsRef = useRef(null);
  const confidenceRef = useRef(null);
  const inputClassNameRef = useRef(null);

  const [mobileNetModel, setMobileNetModel] = useState(null);
  const [knnClassifierModel, setKnnClassifierModel] = useState(null);
  const [webcamInput, setWebcamInput] = useState(null);

  const [predictedLabel, setPredictedLabel] = useState(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const createKNNClassifier = async () => {
      console.log('Loading KNN Classifier');
      return await knnClassifier.create();
    };

    const createMobileNetModel = async () => {
      console.log('Loading Mobilenet Model');
      return await mobilenet.load();
    };

    const createWebcamInput = async () => {
      console.log('Loading Webcam Input');
      const webcamElement = webcamRef.current;
      return await tf.data.webcam(webcamElement);
    };

    const initializeModels = async () => {
      setMobileNetModel(await createMobileNetModel());
      setKnnClassifierModel(await createKNNClassifier());
      setWebcamInput(await createWebcamInput());
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

  useEffect(() => {
    if (mobileNetModel && knnClassifierModel && webcamInput) {
      imageClassificationWithTransferLearningOnWebcam();
    }
  }, [mobileNetModel, knnClassifierModel, webcamInput]);

  // side effect to load model
  useEffect(() => {
    (async () => {
      if (!knnClassifierModel || !mobileNetModel || !webcamInput) {
        return;
      }
      setUploadedModel(true);
      const loadedModel = sampleModel;

      Object.keys(loadedModel).forEach((key) => {
        loadedModel[key] = tf.tensor(loadedModel[key], [
          loadedModel[key].length / 1024,
          1024,
        ]);
        setClasses((prevClasses) => [...prevClasses, key]);
      });
      knnClassifierModel.setClassifierDataset(loadedModel);
      console.log('classifier has been set up!');
    })();
  }, [knnClassifierModel, mobileNetModel, webcamInput]);

  const addClass = () => {
    const inputClassName = inputClassNameRef.current.value;
    const found = classes.some((el) => el.name === inputClassName);
    if (!found) {
      setIdentity((prevIdentity) => prevIdentity + 1);
      setClasses((prevClasses) => [
        ...prevClasses,
        { id: identity + 1, name: inputClassName, count: 0 },
      ]);
    }
    inputClassNameRef.current.value = '';
  };

  const saveClassifier = (classifierModel) => {
    let datasets = classifierModel.getClassifierDataset();
    let datasetObject = {};
    let i = 0;
    Object.keys(datasets).forEach((key) => {
      let data = datasets[key].dataSync();
      datasetObject[classes[i].name] = Array.from(data);
      i += 1;
    });
    let jsonModel = JSON.stringify(datasetObject);
    let downloader = document.createElement('a');
    downloader.download = 'model.json';
    downloader.href =
      'data:text/text;charset=utf-8,' + encodeURIComponent(jsonModel);
    document.body.appendChild(downloader);
    downloader.click();
    downloader.remove();
  };

  const uploadModel = async (classifierModel, event) => {
    setUploadedModel(true);
    let inputModel = event.target.files;
    let fr = new FileReader();
    if (inputModel.length > 0) {
      fr.onload = async () => {
        var dataset = fr.result;
        var tensorObj = JSON.parse(dataset);

        Object.keys(tensorObj).forEach((key) => {
          tensorObj[key] = tf.tensor(tensorObj[key], [
            tensorObj[key].length / 1024,
            1024,
          ]);
          setClasses((prevClasses) => [...prevClasses, key]);
        });
        classifierModel.setClassifierDataset(tensorObj);
        console.log('Classifier has been set up! Congrats! ');
      };
    }
    await fr.readAsText(inputModel[0]);
  };

  const downloadModel = async (classifierModel) => {
    saveClassifier(classifierModel);
  };

  const addDatasetClass = async (classId) => {
    const img = await webcamInput.capture();
    const activation = mobileNetModel.infer(img, 'conv_preds');
    knnClassifierModel.addExample(activation, classId);

    let classIndex = classes.findIndex((el) => el.id === classId);
    let currentCount = classes[classIndex].count;
    currentCount += 1;
    setClasses((prevClasses) => [
      ...prevClasses.slice(0, classIndex),
      { ...prevClasses[classIndex], count: currentCount },
      ...prevClasses.slice(classIndex + 1),
    ]);

    img.dispose();
  };
  const imageClassificationWithTransferLearningOnWebcam = async () => {
    while (true) {
      if (knnClassifierModel.getNumClasses() > 0) {
        const img = await webcamInput.capture();
        const activation = mobileNetModel.infer(img, 'conv_preds');
        const result = await knnClassifierModel.predictClass(activation);
        if (predictedLabel !== result?.label) {
          setPredictedLabel(result?.label);
        }
        img.dispose();
      }
      await tf.nextFrame();
    }
  };

  function handleSaveInput() {
    if (predictedLabel) {
      setLabel(label + letters[predictedLabel]);
    }
  }

  function handleSpaceInput() {
    setLabel(label + ' ');
  }

  function handleDeleteInput() {
    if (label && label.length > 0) {
      setLabel(label.substring(0, label.length - 1));
    }
  }

  function handleClearInput() {
    setLabel('');
  }

  function formatPredictedLabel(label) {
    if (!label) {
      return '';
    }
    return letters[label] || '';
  }

  return (
    <div className="web_cam__container">
      <video ref={webcamRef} autoPlay className="web_cam__video" />
      <h1 className="predicted_label__title">Predicted Label</h1>
      {predictedLabel && (
        <div className="predicted_label__container">
          <h3>{formatPredictedLabel(predictedLabel)}</h3>
        </div>
      )}
      <br />
      <input value={label} className="label__input" disabled />

      <div className="button_row">
        <button className="input_btn" onClick={handleSaveInput}>
          Save
        </button>
        <button className="input_btn" onClick={handleSpaceInput}>
          Space
        </button>
        <button className="input_btn" onClick={handleDeleteInput}>
          Delete
        </button>
        <button className="input_btn" onClick={handleClearInput}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default TrainingPage;
